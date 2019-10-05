/**
 * Class representing the Notification controller
 * @class Notification
 * @description notification controller
 */
class Notification {
  /**
   * @param {object} req HTTP request object
   * @param {object} user Sequelize instance of the user who created a request
   * @returns {boolean} sends notifications
   */
  static async newTripRequest(req, user) {
    const message = `${user.username} created a new travel request`;
    const isEmitted = await req.io.emit(user.lineManager, message);
    if (isEmitted) return true;
    return false;
  }

  /**
   * @param {object} req HTTP request object
   * @param {object} user Sequelize instance of the user who edited a request
   * @returns {boolean} sends notifications
   */
  static async editTripRequest(req, user) {
    const message = `${user.username} edited a request`;
    const isEmitted = await req.io.emit(user.lineManager, message);
    if (isEmitted) return true;
    return false;
  }

  /**
   * @param {object} req HTTP request object
   * @param {object} user Sequelize instance of the user who created a request
   * @param {object} Request Sequelize instance of the request
   * @returns {boolean} sends notifications
   */
  static async userEditedRequest(req, user) {
    const message = `Hello ${user.username}, you edited a travel request`;
    const isEmitted = await req.io.emit(user.id, message);
    if (isEmitted) return true;
    return false;
  }

  /**
   * @param {object} req HTTP request object
   * @param {object} user Sequelize instance of the user who edited a request
   * @returns {boolean} sends notifications
   */
  static async approvedTripRequest(req, user) {
    const message = `Hello ${user.username}, Your Request has been approved `;
    const isEmitted = await req.io.emit(user.id, message);
    if (isEmitted) return true;
    return false;
  }
}
export default Notification;
