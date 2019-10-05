import { CarController } from '../controllers';
import { Authorization } from '../middlewares';

const UploadRoute = app => {
  app.post('/api/v1/car/upload', Authorization.checkToken, CarController.addCar);
  app.patch('/api/v1/car/update',
    Authorization.checkToken,
    CarController.updateCarInformation);
  app.post('/api/v1/upload/one', Authorization.checkToken, CarController.uploadOne);
};

export default UploadRoute;
