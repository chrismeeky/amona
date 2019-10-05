import carRoute from './carRoute';
import authRoute from './authRoute';
import userRoute from './userRoute';

const routes = app => {
  carRoute(app);
  authRoute(app);
  userRoute(app);
};
export default routes;
