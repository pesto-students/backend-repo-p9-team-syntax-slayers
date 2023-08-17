import { Request, Response } from 'express';
import tryCatchWrapper from '../utils/sentryWrapper';
import sendResponse from '../utils/sendResponse';
import { postgresConnection } from '../config/dbConfig';
import { Cart } from '../postgres/entity/Cart.entity';

const addToCart = async (req: Request, res: Response): Promise<void> => {
  tryCatchWrapper(res, async () => {
    const payload = req.body;
    const { salonId, userId, serviceId } = payload;

    const manager = (await postgresConnection).manager;
    let cart = await manager.query(`select * from cart where "userId" = $1`, [
      userId,
    ]);

    if (cart.length && cart[0].salonId != salonId) {
      sendResponse(res, 409, false, 'cart already exists for a salon');
      return; // Stop execution here if cart for different salon exists
    }

    if (!cart.length) {
      // If no cart exists, create one
      await manager.query(
        `
        INSERT INTO "cart" ("userId", "salonId")
        VALUES ($1, $2)
      `,
        [userId, salonId],
      );

      // Fetch the newly created cart
      cart = await manager.query(
        `
        SELECT * FROM "cart" WHERE "userId" = $1 AND "salonId" = $2
      `,
        [userId, salonId],
      );
    }
    // Add the service to the cart
    await manager.query(
      `
      INSERT INTO "cart_services_service" ("cartId", "serviceId")
      VALUES ($1, $2)
      `,
      [cart[0].id, serviceId],
    );

    sendResponse(res, 200, payload);
  });
};

const removeFromCart = async (req: Request, res: Response): Promise<void> => {
  tryCatchWrapper(res, async () => {
    const { salonId, userId, serviceId } = req.body;

    const manager = (await postgresConnection).manager;

    // First, check if a cart exists for the user and the salon
    let cart = await manager.query(
      `
      SELECT * FROM "cart" WHERE "userId" = $1 AND "salonId" = $2
    `,
      [userId, salonId],
    );

    if (!cart.length) {
      // If no cart exists, return an error
      sendResponse(res, 404, false, 'No cart found for the user and salon');
      return;
    }

    let cartServices = await manager.query(
      `
      SELECT * FROM "cart_services_service" WHERE "cartId" = $1
    `,
      [cart[0].id],
    );

    if (cartServices.length === 1) {
      await manager.query(`DELETE from cart where "userId"=$1`, [userId]);

      sendResponse(res, 200, true, 'Cart cleared');
      return;
    }
    // Delete the service from the cart
    await manager.query(
      `
      DELETE FROM "cart_services_service" WHERE "cartId" = $1 AND "serviceId" = $2
      `,
      [cart[0].id, serviceId],
    );

    sendResponse(res, 200, true, 'removed from cartd');
  });
};

const getCartListForUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  tryCatchWrapper(res, async () => {
    let { userId } = req.params;
    userId = userId.trim(); // Remove leading/trailing whitespaces and newlines

    const manager = (await postgresConnection).manager;

    let cart = await manager.query(`select * from cart where "userId"=$1`, [
      userId,
    ]);

    if (cart.length) {
      let listOfServicesId = await manager.query(
        `
        SELECT service.* FROM service 
        JOIN cart_services_service ON service.id = cart_services_service."serviceId" 
        WHERE cart_services_service."cartId" = $1
        `,
        [cart[0].id],
      );
      sendResponse(res, 200, true, 'list of services', listOfServicesId);
      return;
    }
    sendResponse(res, 200, false, 'cart is empty');
    return;
  });
};

const clearCart = async (req: Request, res: Response): Promise<void> => {
  tryCatchWrapper(res, async () => {
    let { userId } = req.body;

    const manager = (await postgresConnection).manager;

    const cartBeforeClear = await manager.query(
      `SELECT * from cart where "userId"=$1`,
      [userId],
    );
    if (cartBeforeClear.length === 0) {
      sendResponse(res, 404, false, 'Cart is already empty');
      return;
    }

    await manager.query(`DELETE from cart where "userId"=$1`, [userId]);

    sendResponse(res, 200, true, 'Cart cleared');
  });
};

export { addToCart, removeFromCart, getCartListForUser, clearCart };
