import * as nodemailer from 'nodemailer'
const transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASSWORD
    }
})

export const sendVerificationEmail = async (email:string,url:string) =>{
    try {
        await transporter.sendMail({
            from: '"Shopping app" <shopping-app@example.com>',
            to: email,
            subject: "Account Verification",
            text: "Click on the link below to verify your account: " + url,
            html: '<b>Hello! </b><br> Welcome to the app. Click on the link' +
                ' below to verify your account :<br><a  target="_blank"' +
                ' href=' + url + '>Click' +
                ' me!</a>',
        })
        console.log('Verification email sent successfully!');
    } catch (e) {
        console.log(e)
    }
}

export const sendResetPasswordEmail = async (email:string,url:string) =>{
    try {
        await transporter.sendMail({
            from: '"Shopping app" <shopping-app@example.com>',
            to: email,
            subject: "Password Reset",
            text: "Click on the link below to verify your account: " + url,
            html: '<b>Hello! </b><br> Welcome back. Click on the link' +
                ' below to reset your :<br><a  target="_blank"' +
                ' href=' + url + '>Click' +
                ' me!</a>',
        })
        console.log('Password reset email sent successfully!');
    } catch (e) {
        console.log(e)
    }
}

export const sendNewPasswordEmail = async (email:string,password:string) =>{
    try {
        await transporter.sendMail({
            from: '"Shopping app" <shopping-app@example.com>',
            to: email,
            subject: "New Password",
            text: "Here is your new password, please save it: " + password

        })
        console.log('New password email sent successfully!');
    } catch (e) {
        console.log(e)
    }
}

