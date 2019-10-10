import { Request, Car } from '../models';
import { HelperMethods } from '../utils';

/**
 * class representing Request Controller
 * @class RequestController
 * @description Request controller
 */
class RequestController {
  /**
   * Create a new request
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
      if (requests.length) {
        return HelperMethods.clientError(res, 'it appears this request already exists');
      }
      const carExist = await Car.findById(carId);
      if (!carExist) return HelperMethods.clientError(res, 'car not found');
      if (carExist.status !== 'available') {
        return HelperMethods.clientError(res, 'This car is no longer available');
      }

      const request = new Request({
        carId,
        driver: id,
      });
      await request.save();
      return HelperMethods.requestSuccessful(res, request, 201);
    } catch (error) {
      return HelperMethods.serverError(res, error.message);
    }
  }

  /**
   * Create a new request
   * Route: POST: /request
   * @param {object} req - HTTP Request object
   * @param {object} res - HTTP Response object
   * @return {res} res - HTTP Response object
   * @memberof RequestController
   */
  static async updateRequestStatus(req, res) {
    const { body: { requestId, status }, decoded: { id } } = req;
    try {
      const requests = await Request.findById({ _id: requestId });
      if (!requests) {
        return HelperMethods.clientError(res, 'it appears this request does not exists');
      }
      if (requests.status === 'closed') {
        return HelperMethods.clientError(res, 'a closed request cannot be updated');
      }
      const carExist = await Car.findById(requests.carId);
      if (!carExist) return HelperMethods.clientError(res, 'car not found');
      if (carExist.status !== 'available') {
        return HelperMethods.clientError(res, 'This car is no longer available');
      }
      if (id !== carExist.owner.toString()) {
        return HelperMethods.clientError(res,
          'you are not authorized to update this request');
      }
      await Request.updateOne({ _id: requestId }, { $set: { status } });
      return HelperMethods.requestSuccessful(res,
        'request status has been updated successfully', 200);
    } catch (error) {
      return HelperMethods.serverError(res, error.message);
    }
  }
}
export default RequestController;
