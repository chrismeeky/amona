import { RequestController } from '../controllers';
import { Authorization } from '../middlewares';

const requestRoute = app => {
  app.post('/api/v1/request',
    Authorization.checkToken,
    RequestController.createRequest);
  app.patch('/api/v1/request',
    Authorization.checkToken,
    RequestController.updateRequestStatus);
};
export default requestRoute;
