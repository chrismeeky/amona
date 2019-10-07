import { User } from '../models';
import { cloudinary } from '../config';
import {
  Authentication, SendEmail, HelperMethods, CryptData
} from '../utils';

/**
 * Class representing the user controller
 * @class UserController
 * @description users controller
 */
class UserController {
  /**
   * This method creates a temporary token and then
   * sends an email to the user.
   * @param {object} userExist - An object containing details of the
   * user we want to send an email to.
   * @returns {boolean} isEmailSent - Tells if email was actually sent
   */
  static async createTokenAndSendEmail(userExist) {
    const tokenCreated = await Authentication.getToken(userExist, '1h');
    if (tokenCreated) {
      const isEmailSent = await
      SendEmail.verifyEmail(userExist.email, userExist.firstName, tokenCreated);
      return isEmailSent;
    }
  }

  /**
   * Login a user
   * Route: POST: /auth/login
   * @param {object} req - HTTP Request object
   * @param {object} res - HTTP Response object
   * @return {res} res - HTTP Response object
   * @memberof UserController
   */
  static async login(req, res) {
    try {
      const {
        email,
        password
      } = req.body;
      const userFound = await User.findOne({ email });
      if (!userFound) {
        return HelperMethods.clientError(res, 'Email or password does not exist', 400);
      }
      if (!userFound.isVerified) {
        return HelperMethods.clientError(res, {
          success: false,
          message: 'You had started the registration process already. '
            + 'Please check your email to complete your registration.'
        }, 400);
      }
      const isPasswordValid = await CryptData.decryptData(password, userFound.password);
      if (userFound && isPasswordValid) {
        const tokenCreated = await Authentication.getToken({
          id: userFound.id,
          username: userFound.username,
          role: userFound.role,
        });
        if (tokenCreated) {
          const userDetails = {
            id: userFound.id,
            username: userFound.username,
            role: userFound.role,
            token: tokenCreated,
          };
          return HelperMethods.requestSuccessful(res, {
            success: true,
            message: 'Login successful',
            userDetails,
          }, 200);
        }
        return HelperMethods.serverError(res);
      }
      return HelperMethods.clientError(res, 'Email or password does not exist', 400);
    } catch (error) {
      return HelperMethods.serverError(res);
    }
  }

  /**
   * Sign up a user
   * Route: POST: /auth/signup
   * @param {object} req - HTTP Request object
   * @param {object} res - HTTP Response object
   * @return {res} res - HTTP Response object
   * @memberof UserController
   */
  static async signUp(req, res) {
    const { email, password } = req.body;
    try {
      const userExist = await User.findOne({ email, });
      if (userExist) {
        if (!userExist.isVerified) {
          const isEmailSent = await
          UserController.createTokenAndSendEmail(userExist);
          if (isEmailSent) {
            return HelperMethods
              .requestSuccessful(res, {
                message: 'You had started the registration '
                  + 'process earlier. '
                  + 'An email has been sent to your email address. '
                  + 'Please check your email to complete your registration.'
              }, 200);
          }
          return HelperMethods
            .serverError(res, 'Your registration could not be completed.'
              + ' Please try again');
        }
        if (userExist.isVerified === true) {
          return HelperMethods
            .requestSuccessful(res, {
              message: 'You are a registered user on '
                + 'this platform. Please proceed to login'
            }, 200);
        }
      }
      const userNameExist = await User.findOne({ username: req.body.username });

      if (userNameExist) {
        return HelperMethods.clientError(res, 'username already exists');
      }

      req.body.password = await CryptData.encryptData(password);
      const user = new User(req.body);
      const userCreated = await user.save();
      if (userCreated) {
        const isEmailSent = await
        UserController.createTokenAndSendEmail(userCreated);
        if (isEmailSent) {
          return HelperMethods
            .requestSuccessful(res, {
              success: true,
              message: 'An email has been sent to your '
                + 'email address. Please check your email to complete '
                + 'your registration'
            }, 200);
        }
        return HelperMethods
          .serverError(res, 'Your registration could not be completed.'
            + 'Please try again');
      }
    } catch (error) {
      return HelperMethods.serverError(res);
    }
  }

  /**
   *
   * @description method that updates user's profile
   * @static
   * @param {object} req HTTP Request object
   * @param {object} res HTTP Response object
   * @returns {object} HTTP Response object
   * @memberof ProfileController
   */
  static async updateProfile(req, res) {
    const fileName = Object.keys(req.files)[0];
    try {
      if (fileName) {
        const result = await cloudinary.v2.uploader.upload(req.files[fileName].path);
        if (result.url) {
          req.body.profilePicture = result.url;
        }
      }
      const userExist = await User.findOne({ _id: req.decoded.id });
      if (userExist) {
        if (!userExist.isVerified) {
          return HelperMethods.clientError(
            res, 'You cannot perform this action. You are not a verified user.', 400
          );
        }
        const userNameExist = await User.findOne({ username: req.body.username });

        if (userNameExist) {
          return HelperMethods.clientError(res, 'username already exists');
        }
        await User.updateOne({ _id: req.decoded.id }, { $set: req.body });
        const user = await User.findById(req.decoded.id);
        console.info(user);
        return HelperMethods
          .requestSuccessful(res, {
            success: true,
            message: 'profile updated successfully',
          }, 200);
      }
      return HelperMethods.clientError(res, 'User does not exist', 404);
    } catch (error) {
      return HelperMethods.serverError(res);
    }
  }

  /**
   *
   * @description method that gets current user's settings
   * @static
   * @param {object} req client request
   * @param {object} res server response
   * @returns {object} server response object
   * @memberof ProfileController
   */
  static async getProfile(req, res) {
    try {
      const user = await User.findOne({ _id: req.body.id });
      if (user) {
        return HelperMethods.requestSuccessful(res, {
          success: true,
          userDetails: user,
        }, 200);
      }
      return HelperMethods.clientError(res, 'User not found', 404);
    } catch (error) {
      return HelperMethods.serverError(res);
    }
  }

  /**
   * Verify a user's email
   * Route: POST: /auth/verify_email
   * @param {object} req - HTTP Request object
   * @param {object} res - HTTP Response object
   * @return {res} res - HTTP Response object
   * @memberof UserController
   */
  static async verifyEmail(req, res) {
    try {
      const foundUser = await User.findOne({ _id: req.decoded.id });
      if (foundUser) {
        const userUpdated = await User.updateOne({ _id: req.decoded.id },
          { $set: { isVerified: true } });
        if (userUpdated) {
          const isEmailSent = await
          SendEmail.confirmRegistrationComplete(foundUser.email);
          if (isEmailSent) {
            const tokenCreated = await Authentication.getToken(userUpdated);
            return res.status(201).json({
              success: true,
              message: `User ${foundUser.username} created successfully`,
              id: userUpdated.id,
              username: userUpdated.username,
              token: tokenCreated,
            });
          }
        }
      }
      return HelperMethods
        .serverError(res, 'Could not complete your registration. '
          + 'Please re-register.');
    } catch (error) {
      return HelperMethods.serverError(res);
    }
  }

  /**
   * Verify a user's email
   * Route: POST: /update_user
   * @param {object} req - HTTP Request object
   * @param {object} res - HTTP Response object
   * @return {res} res - HTTP Response object
   * @memberof UserController
   */
  static async updateUserRole(req, res) {
    const payload = req.decoded;
    const {
      role,
      email
    } = req.body;
    try {
      if (payload.role !== 'Super Administrator') {
        return HelperMethods.clientError(res, 'Only a super admin'
          + ' can update user role', 401);
      }
      const userToUpdate = await User.findOne({ email });
      if (!userToUpdate) {
        return HelperMethods.clientError(res,
          'User not found', 404);
      }
      if (userToUpdate.role === role) {
        return HelperMethods.clientError(res, `user is already a ${role}`, 409);
      }
      await User.updateOne({ email }, { $set: { role } });
      return HelperMethods
        .requestSuccessful(res, {
          success: true,
          message: 'Role updated successfully',
        }, 200);
    } catch (error) {
      if (error.errors) return HelperMethods.sequelizeValidationError(res, error);
      return HelperMethods.serverError(res);
    }
  }

  /**
  * Sends Emails To Users For Password Reset.
  * Route: POST: /api/v1/reset_password
  * @param {object} req - HTTP Request object
  * @param {object} res - HTTP Response object
  * @param {object} next - HTTP Response object
  * @return {res} res - HTTP Response object
  * @memberof UserController
 */
  static async resetPassword(req, res) {
    try {
      const { email } = req.body;
      const userFound = await User.findOne({ email });
      if (!userFound) {
        return HelperMethods.clientError(res, 'Invalid user details.', 400);
      }
      if (!userFound.isVerified) {
        return HelperMethods.clientError(res,
          'You are not a verified user. Please verify your email address', 400);
      }
      const emailSent = await SendEmail.resetPassword(email);
      if (emailSent) {
        return HelperMethods.requestSuccessful(res, {
          success: true,
          message: 'An email has been sent to your email '
            + 'address that explains how to reset your password'
        }, 200);
      }
      return HelperMethods.serverError(res,
        'Could not send reset instructions to your email. Please, try again');
    } catch (error) {
      return HelperMethods.serverError(res);
    }
  }

  /**
   * Update rememberDetails column of a user
   * Route: POST: api/v1/
   * @param {object} req - HTTP Request object
   * @param {object} res - HTTP Response object
   * @return {res} res - HTTP Response object
   * @memberof UserController
   */
  static async rememberUserDetails(req, res) {
    try {
      const { id } = req.decoded;
      const { rememberDetails } = req.body;
      const update = await User.updateOne({ _id: id },
        { $set: { rememberDetails, } });

      if (!update) {
        return HelperMethods.clientError(res, 'User not found', 404);
      }

      return HelperMethods.requestSuccessful(
        res, {
          success: true,
          message: 'Update successful',
          rememberDetails: update.get().rememberDetails
        }, 200
      );
    } catch (error) {
      return HelperMethods.serverError(res);
    }
  }
}

export default UserController;
