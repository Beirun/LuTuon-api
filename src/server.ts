import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import account from './routes/account'
import feedback from './routes/feedback'
import notification from './routes/notification'
import reset from './routes/resetPassword'
import log from './routes/log'
import game from './routes/game'

dotenv.config();

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// allow cors requests from any origin and with credentials
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

app.use("/accounts",account);
app.use("/feedbacks",feedback);
app.use("/notifications",notification);
app.use("/reset",reset);
app.use("/logs", log);
app.use("/game",game);

const port = process.env.NODE_ENV === 'development' ? (process.env.PORT || 80) : 3000;
app.listen(port as number, "0.0.0.0", () => {
  console.log(`Server listening on http://0.0.0.0:${port}`);
});