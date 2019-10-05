import states from '../constants/states';
/**
 * @class ProcessImage
 * @description Processes uploaded images
 */
class ImageProcessor {
  /**
  * @param {string} information - contains license plate information
  * @return {string} - license number
  * @memberof ProcessImage
 */
  static async extractLicenseNumber(information) {
    let licenseNumber;
    const LicenseRegex = /^[a-z0-9]+$/i;
    information.forEach(data => {
      if (!LicenseRegex.test(data) && data.length > 7 && data.length < 10) {
        licenseNumber = data.replace(/\s/g, '');
      }
    });
    return licenseNumber;
  }

  /**
  * @param {string} information - contains license plate information
  * @return {string} - state of registration
  * @memberof ProcessImage
 */
  static async extractState(information) {
    let stateOfRegistration;
    for (let data = 0; data < information.length; data += 1) {
      const foundstate = information[data][0] + information[data].slice(1).toLowerCase();
      if (states.includes(foundstate)) {
        stateOfRegistration = foundstate;
        break;
      } else {
        for (let index = 0; index < states.length; index += 1) {
          if (!information[data].includes('NIGERIA')) {
            const isExist = information[data].split(states[index].toUpperCase());
            if (isExist.length > 1 && !isExist.includes(states[index])) {
              stateOfRegistration = states[index];
              break;
            }
          }
        }
      }
    }

    if (stateOfRegistration && stateOfRegistration.includes(',')) {
      stateOfRegistration = stateOfRegistration
        .slice(0, stateOfRegistration.indexOf(','));
    }
    return stateOfRegistration;
  }

  /**
  * @param {string} information - contains license plate information
  * @param {object} result - contains all information about the uploaded car
  * @param {array} results - contains different response objects of the uploaded images
  * @return {string} - license number
  * @memberof ProcessImage
 */
  static async processImage(information, result, results) {
    if (information) {
      console.info('this is the information', information);

      const state = await ImageProcessor.extractState(information);
      const licenseNumber = await ImageProcessor.extractLicenseNumber(information);

      console.info('license number: ', licenseNumber);
      console.info('state exists? ', states.includes(state));

      let licenseLength = licenseNumber.length;

      if (!licenseNumber.includes('-')) licenseLength += 1;

      if ((licenseLength < 9) || !states.includes(state)) {
        results.push({
          success: 'true',
          status: 201,
          message: 'No license found',
          imageUrl: result.url,
        });
      } else {
        results.push({
          success: true,
          status: 200,
          imageUrl: result.url,
          stateRegistered: state,
          licenseNumber,
        });
      }
    } else {
      results.push({
        success: 'true',
        status: 201,
        message: 'No license found',
        imageUrl: result.url,
      });
    }
  }
}

export default ImageProcessor;
