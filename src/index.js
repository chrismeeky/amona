import 'dotenv/config';
import express from 'express';
import multipart from 'connect-multiparty';
import bodyParser from 'body-parser';
import cors from 'cors';
import './config/mongoose';
import routes from './routes/index';

const app = express();

const multipartMiddleware = multipart();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(multipartMiddleware);

routes(app);

const PORT = process.env.PORT || 2000;
app.listen(PORT, console.info(`server started on port ${PORT}`));
