import carRoute from './carRoute';
import authRoute from './authRoute';
import userRoute from './userRoute';
import requestRoute from './requestRoute';

const routes = app => {
  carRoute(app);
  authRoute(app);
  userRoute(app);
  requestRoute(app);
};
export default routes;
