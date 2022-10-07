import express from 'express';
import cors from 'cors';
import { forks, defork } from './api/index.js';

const server = express();

// for limiting API usage later on if needed
const DEV_URLS = ['http://localhost:3000'];
const PROD_URLS = [];
const whitelist = process.env.NODE_ENV === 'production' ? PROD_URLS : DEV_URLS;
const corsOptions = {
	origin: (origin, cb) => {
		// return whitelist.indexOf(origin) !== -1
		// ? cb(null, true);
		// : cb(new Error('Not allowed by CORS'));
		return cb(null, true);
	}
};

server.use(cors(corsOptions));
server.use(express.json());

server.use('/api/forks', forks);
server.use('/api/defork', defork);

server.get('/', (req, res) => {
	res.status(200).json({ success: "You're not insane!" });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}.`));

export default server;
