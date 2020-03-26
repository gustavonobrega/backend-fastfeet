import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import DeliverymanController from './app/controllers/DeliverymanController';
import DeliveryController from './app/controllers/DeliveryController';
import DeliverymanDeliveryController from './app/controllers/DeliverymanDeliveryController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);

// Deliveryman Deliveries
routes.get('/deliveryman/:id/deliveries', DeliverymanDeliveryController.index);
routes.put(
  '/deliveryman/:id/deliveries/:deliveryId',
  DeliverymanDeliveryController.update
);

routes.use(authMiddleware);

// Recipients
routes.post('/recipients', RecipientController.store);
routes.put('/recipients/:id', RecipientController.update);
routes.get('/recipients', RecipientController.index);
routes.get('/recipients/:id', RecipientController.show);
routes.delete('/recipients/:id', RecipientController.delete);

// Deliverymen
routes.post('/deliverymen', DeliverymanController.store);
routes.get('/deliverymen', DeliverymanController.index);
routes.get('/deliverymen/:id', DeliverymanController.show);
routes.put('/deliverymen/:id', DeliverymanController.update);
routes.delete('/deliverymen/:id', DeliverymanController.delete);

// Deliveries
routes.post('/deliveries', DeliveryController.store);
routes.get('/deliveries', DeliveryController.index);
routes.get('/deliveries/:id', DeliveryController.show);
routes.put('/deliveries/:id', DeliveryController.update);
routes.delete('/deliveries/:id', DeliveryController.delete);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
