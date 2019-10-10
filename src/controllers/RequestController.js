import { Request, Car } from '../models';
import { HelperMethods } from '../utils';

/**
 * class representing Request Controller
 * @class RequestController
 * @description Request controller
 */
class RequestController {
  /**
   * Sign up a user
   * Route: POST: /request
   * @param {object} req - HTTP Request object
   * @param {object} res - HTTP Response object
   * @return {res} res - HTTP Response object
   * @memberof RequestController
   */
  static async createRequest(req, res) {
    const { body: { carId }, decoded: { id } } = req;
    try {
      const requests = await Request.find({ driver: id, carId, });
      if (requests) {
        return HelperMethods.clientError(res, 'it appears this request already exists');
      }
      const carExist = await Car.findById(carId);
      if (!carExist) return HelperMethods.clientError(res, 'car not found');
      if (carExist.status !== 'available') {
        return HelperMethods.clientError(res, 'This car is no longer available');
      }

      const request = new Request({
        carId: carExist.owner,
        driver: id,
      });
      await request.save();
      return HelperMethods.requestSuccessful(res, request, 201);
    } catch (error) {
      return HelperMethods.serverError(res, error.message);
    }
  }
}
export default RequestController;
