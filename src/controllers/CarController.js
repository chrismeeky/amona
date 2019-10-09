/* eslint-disable no-await-in-loop */
import { Car, User } from '../models';
import { cloudinary } from '../config';
import { ImageProcessor, HelperMethods } from '../utils';

/**
 * Class representing the Upload controller
 * @class UploadController
 * @description Upload Controller
 */
class CarController {
  /**
     * Handles uploading of images and cars
     * Route: POST: api/v1/upload/car
     * @param {object} req - HTTP Request object
     * @param {object} res - HTTP Response object
     * @return {res} res - HTTP Response object
     * @memberof CarController
     */
  static async addCar(req, res) {
    let result;
    const { id } = req.decoded;
    const { userInputedLicenseNumber } = req.body;
    try {
      const images = Object.keys(req.files);
      if (images.length < 6) {
        return HelperMethods.clientError(res, 'one or more images is missing');
      }
      const results = [];
      for (let i = 0; i < images.length; i += 1) {
        // only process license plates for the first 2 images
        if (i > 1) {
          result = await cloudinary.v2.uploader.upload(req.files[images[i]].path);
          ImageProcessor.processImage(null, result, results);
        } else {
          result = await cloudinary.v2.uploader.upload(req.files[images[i]].path,
            {
              ocr: 'adv_ocr'
            });
          if (result.info.ocr.adv_ocr.status === 'complete') {
            const information = result.info.ocr.adv_ocr.data[0]
              .textAnnotations[0].description.split('\n');
            await ImageProcessor.processImage(information, result, results);
          }
        }
      }
      if (results.length < 6) {
        return res.status(500).json({
          success: false,
          message: 'An error occured while uploading your images'
        });
      }

      if ((results[0] && results[1])
      && results[0].licenseNumber === results[1].licenseNumber) {
        const { licenseNumber } = results[0];
        const licenseExists = await Car.findOne({ extractedLicenseNumber: licenseNumber })
        || Car.findOne({ userInputedLicenseNumber });
        if (licenseExists.pictures) {
          return HelperMethods.clientError(res,
            'ooops! it seems like this car has been previously registered');
        }
        req.body.extractedLicenseNumber = licenseNumber;
        req.body.owner = id;
        req.body.pictures = [
          results[0].imageUrl,
          results[1].imageUrl,
          results[2].imageUrl,
          results[3].imageUrl,
          results[4].imageUrl,
          results[5].imageUrl
        ];
        const car = new Car(req.body);
        const savedCar = await car.save();
        if (savedCar) {
          return HelperMethods.requestSuccessful(res, savedCar, 201);
        }
        return HelperMethods.serverError(res);
      }
      return HelperMethods.clientError(res,
        'license number on both sides of the car must be clear and match');
    } catch (error) {
      return HelperMethods.serverError(res, error.message);
    }
  }

  /**
   *
   * @description method that updates car's information
   * @static
   * @param {object} req HTTP Request object
   * @param {object} res HTTP Response object
   * @returns {object} HTTP Response object
   * @memberof CarController
   */
  static async updateCarInformation(req, res) {
    const { carId, userInputedLicenseNumber } = req.body;
    const fileName = Object.keys(req.files)[0];
    const results = [];

    try {
      const carExist = await Car.findOne({ _id: carId }).populate('owner');

      if (carExist) {
        const { pictures } = carExist;
        if (req.decoded.id !== carExist.owner.id) {
          return HelperMethods.clientError(res, 'only car owner can update his car', 401);
        }
        if ((userInputedLicenseNumber)
        && carExist.userInputedLicenseNumber !== userInputedLicenseNumber) {
          const uploadedBefore = await Car.find({ userInputedLicenseNumber });
          if (uploadedBefore) {
            return HelperMethods.clientError(res,
              'ooops! it seems like this car has been previously registered');
          }
        }
        if (carExist.status !== 'available') {
          return HelperMethods.clientError(res, 'car is no longer available');
        }
        // only process image if it is either front or the back side of the car
        if (fileName === 'front' || fileName === 'back') {
          const result = await cloudinary.v2.uploader.upload(req.files[fileName].path,
            {
              ocr: 'adv_ocr'
            });
          if (result.info.ocr.adv_ocr.status === 'complete') {
            const information = result.info.ocr.adv_ocr.data[0]
              .textAnnotations[0].description.split('\n');
            console.info(information);

            await ImageProcessor.processImage(information, result, results);
            if (results[0].licenseNumber === carExist.extractedLicenseNumber) {
              req.extractedLicenseNumber = results[0].licenseNumber;
            } else {
              HelperMethods.clientError(res, 'You cannot update a different car');
            }
          }
        } else {
          const result = await cloudinary.v2.uploader.upload(req.files[fileName].path);
          if (fileName && result.url) {
            const { url } = result;
            switch (fileName) {
              case 'front':
                pictures[0] = url;
                break;
              case 'rear':
                pictures[1] = url;
                break;
              case 'left':
                pictures[2] = url;
                break;
              case 'right':
                pictures[3] = url;
                break;
              case 'first interior':
                pictures[4] = url;
                break;
              case 'second interior':
                pictures[5] = url;
                break;
              default:
                carExist.pictures = pictures;
            }
            req.body.pictures = pictures;
          }
        }
        await Car.updateOne({ _id: carId }, { $set: req.body });
        return HelperMethods
          .requestSuccessful(res, {
            success: true,
            message: 'car information updated successfully',
          }, 200);
      }
      return HelperMethods.clientError(res, 'car not found', 404);
    } catch (error) {
      return HelperMethods.serverError(res, error.message);
    }
  }

  /**
   *
   * @description method that pulls the list of cars belonging to a driver
   * @static
   * @param {object} req HTTP Request object
   * @param {object} res HTTP Response object
   * @returns {object} HTTP Response object
   * @memberof CarController
   */
  static async findCarsOfOwnerPrivate(req, res) {
    const { id } = req.decoded;
    try {
      const ownersCars = await Car.find({ owner: id });

      if (!ownersCars.length) {
        return HelperMethods.clientError(res, 'no car found');
      }
      return HelperMethods.requestSuccessful(res, ownersCars);
    } catch (error) {
      HelperMethods.serverError(res, error.message);
    }
  }

  /**
   *
   * @description method that pulls the list of cars belonging to a
   * driver with a public profile
   * @static
   * @param {object} req HTTP Request object
   * @param {object} res HTTP Response object
   * @returns {object} HTTP Response object
   * @memberof CarController
   */
  static async findCarsOfOwnerPublic(req, res) {
    const { id } = req.body;
    try {
      const carOwner = await User.find({ _id: id });
      if (!carOwner.private) {
        const ownersCars = await Car.find({ owner: id });
        if (!ownersCars.length) {
          return HelperMethods.clientError(res, 'no car found');
        }
        return HelperMethods.requestSuccessful(res, ownersCars);
      }
      return HelperMethods.clientError(res, 'owner is private');
    } catch (error) {
      HelperMethods.serverError(res, error.message);
    }
  }

  /**
   *
   * @description method that gets a specific car
   * @static
   * @param {object} req HTTP Request object
   * @param {object} res HTTP Response object
   * @returns {object} HTTP Response object
   * @memberof CarController
   */
  static async findACar(req, res) {
    const { carId } = req.body;
    try {
      const car = await Car.findOne({ _id: carId }).populate('owner',
        'firstName lastName userName');
      if (car) {
        return HelperMethods.requestSuccessful(res, car);
      }
      return HelperMethods.clientError(res, 'Car is no longer available');
    } catch (error) {
      HelperMethods.serverError(res, error.message);
    }
  }

  /**
   *
   * @description method that gets all the available cars
   * @static
   * @param {object} req HTTP Request object
   * @param {object} res HTTP Response object
   * @returns {object} HTTP Response object
   * @memberof CarController
   */
  static async findAllCars(req, res) {
    try {
      const car = await Car.find({ status: 'available' }).populate('owner',
        'firstName lastName userName');
      if (car.length) {
        return HelperMethods.requestSuccessful(res, car);
      }
      return HelperMethods.clientError(res, 'no car was found');
    } catch (error) {
      HelperMethods.serverError(res, error.message);
    }
  }

  /**
   *
   * @description method that deletes a car
   * @static
   * @param {object} req HTTP Request object
   * @param {object} res HTTP Response object
   * @returns {object} HTTP Response object
   * @memberof CarController
   */
  static async removeCar(req, res) {
    const { carId } = req.body;
    try {
      const carExist = await Car.findOne({ _id: carId }).populate('owner');
      if (carExist !== null) {
        if (req.decoded.id !== carExist.owner.id) {
          return HelperMethods.clientError(res, 'only car owner can update his car', 401);
        }
        await Car.remove({ _id: carId });
        return HelperMethods
          .requestSuccessful(res, {
            success: true,
            message: 'car has been deleted successfully',
          }, 200);
      }
      return HelperMethods.clientError(res, 'car not found', 404);
    } catch (error) {
      return HelperMethods.serverError(res);
    }
  }

  /**
       * Upload a single image
       * Route: POST: api/v1/upload/one
       * @param {object} req - HTTP Request object
       * @param {object} res - HTTP Response object
       * @return {res} res - HTTP Response object
       * @memberof CarController
       */
  static async uploadOne(req, res) {
    try {
      const result = await cloudinary.v2.uploader.upload(req.files.image.path);
      return HelperMethods.requestSuccessful(res, {
        success: true,
        message: 'uploaded successfully',
        imageUrl: result.url
      }, 200);
    } catch (error) {
      return HelperMethods.serverError(res);
    }
  }
}
export default CarController;
