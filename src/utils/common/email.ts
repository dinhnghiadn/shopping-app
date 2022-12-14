import * as nodemailer from 'nodemailer';
import { Order } from '../../models/entities/Order.entity';
import { Cart } from '../../models/entities/Cart.entity';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APPLICATION_PASSWORD,
  },
});

export const sendVerificationEmail = async (
  email: string,
  url: string
): Promise<void> => {
  try {
    await transporter.sendMail({
      from: '"Shopping app" <nghiagbf31@gmail.com>',
      to: email,
      subject: 'Account Verification',
      text: 'Click on the link below to verify your account: ' + url,
      html:
        '<b>Hello! </b><br> Welcome to the app. Click on the link' +
        ' below to verify your account :<br><a  target="_blank"' +
        ' href=' +
        url +
        '>Click' +
        ' me!</a>',
    });
    console.log('Verification email sent successfully!');
  } catch (e) {
    console.log(e);
  }
};

export const sendResetPasswordEmail = async (
  email: string,
  url: string
): Promise<void> => {
  try {
    await transporter.sendMail({
      from: '"Shopping app" <nghiagbf31@gmail.com>',
      to: email,
      subject: 'Password Reset',
      text: 'Click on the link below to verify your account: ' + url,
      html:
        '<b>Hello! </b><br> Welcome back. Click on the link' +
        ' below to reset your :<br><a  target="_blank"' +
        ' href=' +
        url +
        '>Click' +
        ' me!</a>',
    });
    console.log('Password reset email sent successfully!');
  } catch (e) {
    console.log(e);
  }
};

export const sendNewPasswordEmail = async (
  email: string,
  password: string
): Promise<void> => {
  try {
    await transporter.sendMail({
      from: '"Shopping app" <nghiagbf31@gmail.com>',
      to: email,
      subject: 'New Password',
      text: 'Here is your new password, please save it: ' + password,
    });
    console.log('New password email sent successfully!');
  } catch (e) {
    console.log(e);
  }
};

export const sendPaymentEmail = async (
  email: string,
  order: Order,
  url?: string
): Promise<void> => {
  try {
    let text = `Hi ${order.user.username}, your transaction was successful. Here is the detail: 
            \n- Amount: ${order.totalAmount}$.
            \n- Method: ${order.paymentMethod}.
            \n- Status: ${order.status}.
            `;
    if (url !== undefined) {
      text += `\n- Payment url: ${url}
            `;
    }
    await transporter.sendMail({
      from: '"Shopping app" <nghiagbf31@gmail.com>',
      to: email,
      subject: 'Your payment was successfully processed',
      text: text + `\n- Thank you for your billing`,
    });
    console.log('New payment email sent successfully!');
  } catch (e) {
    console.log(e);
  }
};

export const sendReminderEmail = async (email: string, cart: Cart): Promise<void> => {
  let arrayItems = '';
  cart.products.forEach((product) => {
    arrayItems += `<li>Item: 
      ${product.product.name}
       - Price:  
      ${product.product.price} 
      - Quantity:  
      ${product.quantity} 
      </li>`;
  });
  try {
    await transporter.sendMail({
      from: '"Shopping app" <nghiagbf31@gmail.com>',
      to: email,
      subject: 'You items in your cart...',
      html: `Hi there, you have items in your cart. Here is the detail:
                <ul>${arrayItems}</ul>
                <ul><li><h3>Total amount: ${cart.totalAmount}$</h3></li></ul>
                Thank you for coming with us.`,
    });
    console.log(`New reminder email to ${email} sent successfully!`);
  } catch (e) {
    console.log(e);
  }
};
