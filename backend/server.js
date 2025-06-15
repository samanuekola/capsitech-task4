const http = require('http');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { URL } = require('url');
const SECRET = 'MY_SECRET';

mongoose.connect("mongodb+srv://samanuesam:samanue123@cluster0.jkqgpvi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const dataSchema = new mongoose.Schema({
  name: String,
  age: Number,
  email: String,
  hobby: String,
  userId: mongoose.Schema.Types.ObjectId,
});

const User = mongoose.model('User', userSchema);
const Data = mongoose.model('Data', dataSchema);

const parseBody = req =>
  new Promise(resolve => {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => resolve(JSON.parse(body)));
  });

const authenticate = async (req, res) => {
  const auth = req.headers['authorization'];
  if (!auth) return null;
  try {
    const token = auth.split(' ')[1];
    return jwt.verify(token, SECRET);
  } catch {
    res.writeHead(401).end('Unauthorized');
    return null;
  }
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  res.setHeader('Access-Control-Allow-Origin', '');
  res.setHeader('Access-Control-Allow-Headers', '');
  res.setHeader('Access-Control-Allow-Methods', '*');
  if (req.method === 'OPTIONS') return res.end();

  if (path === '/register' && req.method === 'POST') {
    const { username, password } = await parseBody(req);
    const hash = await bcrypt.hash(password, 10);
    await User.create({ username, password: hash });
    return res.end(JSON.stringify({ success: true }));
  }

  if (path === '/login' && req.method === 'POST') {
    const { username, password } = await parseBody(req);
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user._id }, SECRET);
      return res.end(JSON.stringify({ token }));
    }
    return res.writeHead(401).end('Invalid credentials');
  }

  const user = await authenticate(req, res);
  if (!user) return;

  if (path === '/data' && req.method === 'POST') {
    const { name, age, email, hobby } = await parseBody(req);
    const entry = await Data.create({ name, age, email, hobby, userId: user.id });
    return res.end(JSON.stringify(entry));
  }

  if (path === '/data' && req.method === 'GET') {
    const items = await Data.find({ userId: user.id });
    return res.end(JSON.stringify(items));
  }

  if (path.startsWith('/data/') && req.method === 'PUT') {
    const id = path.split('/')[2];
    const updates = await parseBody(req);
    const updated = await Data.findOneAndUpdate({ _id: id, userId: user.id }, updates, { new: true });
    return res.end(JSON.stringify(updated));
  }

  if (path.startsWith('/data/') && req.method === 'DELETE') {
    const id = path.split('/')[2];
    await Data.findOneAndDelete({ _id: id, userId: user.id });
    return res.end(JSON.stringify({ success: true }));
  }

  res.writeHead(404).end('Not found');
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Backend running on port ${PORT}`));