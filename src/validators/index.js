import { body } from "express-validator";
import { param } from "express-validator";

const userRegisterValidations = () => {

    return [
        body("fullName")
            .trim()
            .notEmpty()
            .withMessage("The full name is required"),

        body("email")
            .trim()
            .notEmpty()
            .withMessage("The email is required")
            .toLowerCase()
            .isEmail()
            .withMessage("The email is not in proper format"),

        body("username")
            .trim()
            .notEmpty()
            .withMessage("The username is required"),

        body("password")
            .trim()
            .notEmpty()
            .withMessage("The password is required")
            .isLength({ min: 6 })
            .withMessage("The  password must be of minimum length 6")

    ]

}
const userLoginValidations = () => {

    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("The email is required")
            .toLowerCase()
            .isEmail()
            .withMessage("The email is not in proper format"),

        body("username")
            .trim()
            .notEmpty()
            .withMessage("The username is required"),

        body("password")
            .trim()
            .notEmpty()
            .withMessage("The  password is required")
            .isLength({ min: 6 })
            .withMessage("The  password must be of minimum length 6")
    ]
}
const changePasswordValidations = () => {

    return [
        body("oldPassword")
            .trim()
            .notEmpty()
            .withMessage("The old password is required"),

        body("newPassword")
            .trim()
            .notEmpty()
            .withMessage("The new password is required")
            .isLength({ min: 6 })
            .withMessage("The new password must be of minimum length 6")

    ]
}
const updateAccountValidations = () => {

    return [
        body("fullName")
            .trim()
            .notEmpty()
            .withMessage("The full name is required"),

        body("email")
            .trim()
            .notEmpty()
            .withMessage("The email is required")
            .toLowerCase()
            .isEmail()
            .withMessage("The email is not in proper format")
    ]

}
const getUserChannelProfileValidations = () => {

    return [
        param("username")
            .trim()
            .notEmpty()
            .withMessage("The username is required")
    ]
}
const publishVideoValidations = () => {

    return [

        body("title")
            .trim()
            .notEmpty()
            .withMessage("The title is required")
            .isLength({ min: 3 })
            .withMessage("The title should be of minimum length 3"),

        body("description")
            .trim()
            .notEmpty()
            .withMessage("The description is required")
    ]
}
const updateVideoValidations = () => {

    return [

        body("title")
            .trim()
            .notEmpty()
            .withMessage("The title is required")
            .isLength({ min: 3 })
            .withMessage("The title should be of minimum length 3"),

        body("description")
            .trim()
            .notEmpty()
            .withMessage("The description is required")
    ]
}
const createTweetValidations = () => {

    return [
        body("content")
            .trim()
            .notEmpty()
            .withMessage("The content is required")
    ]
}
const updateTweetValidations = () => {

    return [
        body("content")
            .trim()
            .notEmpty()
            .withMessage("The content is required")
    ]
}
const createPlaylistValidations = () => {

    return [
        body("name")
            .trim()
            .notEmpty()
            .withMessage("The name is required")
            .isLength({ min: 3 })
            .withMessage("The name should be of minimum length 3"),

        body("description")
            .trim()
            .notEmpty()
            .withMessage("The description is required")
    ]
}
const updatePlaylistValidations = () => {

    return [
        body("name")
            .trim()
            .notEmpty()
            .withMessage("The name is required")
            .isLength({ min: 3 })
            .withMessage("The name should be of minimum length 3"),

        body("description")
            .trim()
            .notEmpty()
            .withMessage("The description is required")
    ]
}
const addCommentValidations = () => {

    return [
        body("content")
            .trim()
            .notEmpty()
            .withMessage("The content is required")

    ]
}
const updateCommentValidations = () => {

    return [
        body("content")
            .trim()
            .notEmpty()
            .withMessage("The content is required")

    ]

}

export {
    userRegisterValidations,
    updateAccountValidations,
    changePasswordValidations,
    userLoginValidations,
    getUserChannelProfileValidations,
    publishVideoValidations,
    updateVideoValidations,
    createTweetValidations,
    updateTweetValidations,
    createPlaylistValidations,
    updatePlaylistValidations,
    addCommentValidations,
    updateCommentValidations
}