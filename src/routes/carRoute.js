import { CarController } from '../controllers';
import { Authorization } from '../middlewares';

const CarRoute = app => {
  app.post('/api/v1/car/upload',
    Authorization.checkToken,
    CarController.addCar);
  app.post('/api/v1/upload/one',
    Authorization.checkToken,
    CarController.uploadOne);
  app.patch('/api/v1/car/update',
    Authorization.checkToken,
    CarController.updateCarInformation);
  app.get('/api/v1/owner/cars',
    Authorization.checkToken,
    CarController.findCarsOfOwnerPrivate);
  app.get('/api/v1/owner/cars/public',
    CarController.findCarsOfOwnerPublic);
  app.get('/api/v1/car',
    CarController.findACar);
  app.get('/api/v1/cars',
    CarController.findAllCars);
  app.delete('/api/v1/car',
    Authorization.checkToken,
    CarController.removeCar);
};

export default CarRoute;
