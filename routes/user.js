const express = require('express');
const { check, validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const auth = require('../middleware/auth');

const User = require('../model/User');

/**
 * @method - POST
 * @param - /signup
 * @description - User SignUp
 */

router.post(
  '/signup',
  [
    //используем express validator чтобы проверить валидность данных
    //проверяем что в поле email прилетел валидный емейл, и что пароль содержит   //больше 6 симоволов. подробнее можно почитать в описании библиотеки //https://express-validator.github.io/docs/
    check('username', 'Please Enter a Valid Username').not().isEmpty(),
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Please enter a valid password').isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    const { username, email, password } = req.body;
    try {
      //проверяем что такого пользователя не существует

      let user = await User.findOne({
        email,
      });
      if (user) {
        return res.status(400).json({
          msg: 'User Already Exists',
        });
      }

      user = new User({
        username,
        email,
        password,
      });

      //солим пароль  https://ru.wikipedia.org/wiki/%D0%A1%D0%BE%D0%BB%D1%8C_(%D0%BA%D1%80%D0%B8%D0%BF%D1%82%D0%BE%D0%B3%D1%80%D0%B0%D1%84%D0%B8%D1%8F)
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // сохраняем пользователя
      await user.save();

      const payload = {
        user: {
          id: user.id,
        },
      };

      //создаем токен и отправлем на клиент. еще раз ссылка на то как работает токен // https://habr.com/ru/post/340146/
      jwt.sign(
        payload,
        'randomString',
        {
          expiresIn: 10000,
        },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({
            token,
          });
        },
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Error in Saving');
    }
  },
);

/**
 * @method - POST
 * @description - User Login
 * @param - /user/login
 */

router.post(
  '/login',
  [
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Please enter a valid password').isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;
    try {
      let user = await User.findOne({
        email,
      });
      if (!user)
        return res.status(400).json({
          message: 'User Not Exist',
        });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({
          message: 'Incorrect Password !',
        });

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        'randomString',
        {
          expiresIn: 3600,
        },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({
            token,
          });
        },
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send('Error in Saving');
    }
  },
);

/**
 * @method - GET
 * @description - Get LoggedIn User
 * @param - /user/me
 */

router.get('/me', auth, async (req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (e) {
    res.send({ message: 'Error in Fetching user' });
  }
});

module.exports = router;
