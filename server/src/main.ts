// @ts-nocheck
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  queryUserHotelList,
  getUserHotelDetailPayload,
  refreshUserHotelRoomPrices,
} = require('./user-mock-service');
const { loadRuntimeEntityData, saveRuntimeEntityData } = require('./entity-data-service');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = 'yisu-platform-secret-key-change-in-production';

// 中间件
app.use(cors());
app.use(express.json());

// 默认数据（首次启动写入本地实体数据文件）
const defaultUsers = [
  {
    id: 1,
    username: 'admin',
    passwordHash: '$2a$10$N.FLKNCCcD4ox.hLW6/QjuIk/E7/1nWf2bT1YuyKrCWN9RNiLVViS', // admin123
    role: 'ADMIN'
  },
  // 添加一个测试管理员
  {
    id: 2,
    username: 'testadmin',
    passwordHash: bcrypt.hashSync('123456', 10),
    role: 'ADMIN'
  },
];

const defaultHotels = [
  {
    id: 'h-001',
    name: '易宿臻选酒店（深圳会展中心店）',
    star: '高档型',
    address: '深圳市福田区福华三路 88 号',
    tags: ['近地铁', '含早餐', '免费取消'],
    price: 428,
    promo: '会展差旅专属礼遇，连住 2 晚 95 折',
    intro: '步行可达会展中心，商务出行便捷',
    coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    city: '深圳',
    status: 'APPROVED',
    ownerId: 1
  },
  {
    id: 'h-002',
    name: '海景逸宿酒店（三亚湾店）',
    star: '豪华型',
    address: '三亚市天涯区海滨路 19 号',
    tags: ['海景', '亲子', '免费停车'],
    price: 788,
    promo: '暑期家庭套餐，含双早与儿童乐园票',
    intro: '一线海景阳台，亲子度假热门之选',
    coverImage: 'https://images.unsplash.com/photo-1576675784201-0e142b423952?auto=format&fit=crop&w=1200&q=80',
    city: '三亚',
    status: 'APPROVED',
    ownerId: 1
  }
];

const defaultRooms = [
  {
    id: 'r-001',
    hotelId: 'h-001',
    name: '豪华大床房',
    price: 428,
    stock: 10,
    description: '面积40平米，带独立阳台',
    facilities: ['空调', '电视', '免费WiFi', '迷你吧'],
    status: 'ON'
  },
  {
    id: 'r-002',
    hotelId: 'h-001',
    name: '行政套房',
    price: 688,
    stock: 5,
    description: '面积60平米，行政酒廊待遇',
    facilities: ['空调', '电视', '免费WiFi', '迷你吧', '浴缸'],
    status: 'ON'
  }
];

const runtimeEntityData = loadRuntimeEntityData({
  users: defaultUsers,
  hotels: defaultHotels,
  rooms: defaultRooms,
});

const users = runtimeEntityData.users;
const hotels = runtimeEntityData.hotels;
const rooms = runtimeEntityData.rooms;

const persistRuntimeEntityData = () => {
  try {
    saveRuntimeEntityData({
      users,
      hotels,
      rooms,
    });
  } catch (error) {
    console.error('持久化实体数据失败:', error);
  }
};

const buildUserRuntimeSource = () => ({
  hotels,
  rooms,
});

const normalizeHotelStatus = (status) => {
  if (typeof status !== 'string') {
    return '';
  }

  const normalized = status.toUpperCase();
  return ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'].includes(normalized) ? normalized : '';
};

const canManageHotel = (hotel, user) => {
  if (!hotel || !user) {
    return false;
  }

  return user.role === 'ADMIN' || hotel.ownerId === user.uid;
};

// 认证中间件
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: '未提供认证令牌' });
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: '认证令牌无效' });
  }
};

const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.authTokenInvalid = false;
    return next();
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    req.authTokenInvalid = false;
  } catch (error) {
    req.authTokenInvalid = true;
  }

  next();
};

// 1. 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: '易宿平台API'
  });
});

// 2. 首页
app.get('/', (req, res) => {
  res.json({
    message: '🏨 易宿平台 API 服务器',
    version: '1.0.0',
    endpoints: [
      'GET    /api/hotels - 获取所有酒店',
      'GET    /api/hotels/:id - 获取酒店详情',
      'GET    /api/user/hotels - 获取用户端酒店列表',
      'GET    /api/user/hotels/:id/detail - 获取用户端酒店详情',
      'POST   /api/user/hotels/:id/detail/refresh-prices - 刷新用户端房价',
      'POST   /api/auth/login - 用户登录',
      'POST   /api/auth/register - 用户注册',
      'GET    /api/hotels/:id/rooms - 获取酒店房型',
      'POST   /api/admin/hotels/:id/approve - 管理员审核通过',
      'POST   /api/admin/hotels/:id/reject - 管理员审核拒绝'
    ]
  });
});

// 3. 用户注册
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    }
    
    // 检查用户是否存在
    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
      return res.status(400).json({ success: false, message: '用户名已存在' });
    }
    
    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);
    
    // 创建新用户
    const newUser = {
      id: users.length + 1,
      username,
      passwordHash,
      role: 'USER'
    };
    
    users.push(newUser);
    persistRuntimeEntityData();
    
    // 生成JWT
    const token = jwt.sign(
      { uid: newUser.id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role
        }
      },
      message: '注册成功'
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 4. 用户登录
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ success: false, message: '用户名和密码不能为空' });
    }
    
    // 查找用户
    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
    
    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: '用户名或密码错误' });
    }
    
    // 生成JWT
    const token = jwt.sign(
      { uid: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      },
      message: '登录成功'
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 5. 获取当前用户信息
app.get('/api/auth/profile', authMiddleware, (req, res) => {
  const user = users.find(u => u.id === req.user.uid);
  
  if (!user) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }
  
  res.json({
    success: true,
    data: {
      id: user.id,
      username: user.username,
      role: user.role
    }
  });
});

// 6. 获取酒店列表（公开接口）
app.get('/api/hotels', (req, res) => {
  const { city, keyword, minPrice, maxPrice, tags } = req.query;
  
  let filteredHotels = hotels.filter(hotel => hotel.status === 'APPROVED');
  
  // 按城市筛选
  if (city) {
    filteredHotels = filteredHotels.filter(hotel => hotel.city === city);
  }
  
  // 按关键词筛选
  if (keyword) {
    filteredHotels = filteredHotels.filter(hotel => 
      hotel.name.includes(keyword) || 
      hotel.address.includes(keyword) ||
      (hotel.tags && hotel.tags.some(tag => tag.includes(keyword)))
    );
  }
  
  // 按价格筛选
  if (minPrice) {
    filteredHotels = filteredHotels.filter(hotel => hotel.price >= Number(minPrice));
  }
  
  if (maxPrice) {
    filteredHotels = filteredHotels.filter(hotel => hotel.price <= Number(maxPrice));
  }
  
  // 按标签筛选
  if (tags) {
    const tagArray = tags.split(',');
    filteredHotels = filteredHotels.filter(hotel => 
      hotel.tags && tagArray.some(tag => hotel.tags.includes(tag))
    );
  }
  
  res.json({
    success: true,
    data: {
      list: filteredHotels,
      total: filteredHotels.length,
    },
    total: filteredHotels.length,
  });
});

// 7. 用户端酒店列表（由服务端承接 mock 数据）
app.get('/api/user/hotels', (req, res) => {
  try {
    const result = queryUserHotelList(req.query || {}, buildUserRuntimeSource());

    res.json({
      success: true,
      data: result,
      message: '获取用户端酒店列表成功',
    });
  } catch (error) {
    console.error('获取用户端酒店列表错误:', error);
    res.status(500).json({ success: false, message: '获取用户端酒店列表失败' });
  }
});

// 8. 用户端酒店详情（由服务端承接 mock 数据）
app.get('/api/user/hotels/:id/detail', (req, res) => {
  try {
    const listItemId = typeof req.query.listItemId === 'string' ? req.query.listItemId : undefined;
    const payload = getUserHotelDetailPayload(req.params.id, req.query || {}, listItemId, buildUserRuntimeSource());

    res.json({
      success: true,
      data: payload,
      message: '获取用户端酒店详情成功',
    });
  } catch (error) {
    if (error instanceof Error && error.message === '酒店详情不存在') {
      return res.status(404).json({ success: false, message: '酒店详情不存在' });
    }

    console.error('获取用户端酒店详情错误:', error);
    res.status(500).json({ success: false, message: '获取用户端酒店详情失败' });
  }
});

// 9. 用户端酒店详情房价刷新（由服务端承接 mock 数据）
app.post('/api/user/hotels/:id/detail/refresh-prices', (req, res) => {
  try {
    const bodyFilter = req.body && typeof req.body === 'object' ? req.body : {};
    const queryFilter = req.query && typeof req.query === 'object' ? req.query : {};
    const mergedFilter = { ...queryFilter, ...bodyFilter };
    const listItemIdFromBody = typeof bodyFilter.listItemId === 'string' ? bodyFilter.listItemId : undefined;
    const listItemIdFromQuery = typeof queryFilter.listItemId === 'string' ? queryFilter.listItemId : undefined;
    const payload = refreshUserHotelRoomPrices(
      req.params.id,
      mergedFilter,
      listItemIdFromBody || listItemIdFromQuery,
      buildUserRuntimeSource(),
    );

    res.json({
      success: true,
      data: payload,
      message: '刷新房价成功',
    });
  } catch (error) {
    if (error instanceof Error && error.message === '酒店详情不存在') {
      return res.status(404).json({ success: false, message: '酒店详情不存在' });
    }

    console.error('刷新用户端房价错误:', error);
    res.status(500).json({ success: false, message: '刷新房价失败' });
  }
});

// 7. 获取酒店详情（公开接口）
app.get('/api/hotels/:id', optionalAuthMiddleware, (req, res) => {
  if (req.authTokenInvalid) {
    return res.status(401).json({ success: false, message: '认证令牌无效，请重新登录' });
  }

  const hotel = hotels.find(h => h.id === req.params.id);
  
  if (!hotel) {
    return res.status(404).json({ success: false, message: '酒店不存在' });
  }
  
  // 用户只能看到已审核的酒店，管理员和酒店所有者可以看到所有
  const isAdmin = req.user && req.user.role === 'ADMIN';
  const isOwner = req.user && hotel.ownerId === req.user.uid;
  if (hotel.status !== 'APPROVED' && !isAdmin && !isOwner) {
    return res.status(403).json({ success: false, message: '酒店不可访问' });
  }
  
  res.json({
    success: true,
    data: hotel
  });
});

// 8. 创建酒店（需要登录）
app.post('/api/hotels', authMiddleware, (req, res) => {
  try {
    const { name, city, address, description, star, tags, price, promo, coverImage, intro } = req.body;
    
    if (!name || !city || !address) {
      return res.status(400).json({ success: false, message: '名称、城市和地址是必填项' });
    }
    
    const newHotel = {
      id: `h-${(hotels.length + 1).toString().padStart(3, '0')}`,
      name,
      city,
      address,
      description,
      star,
      tags: tags || [],
      price: price || 0,
      promo,
      coverImage,
      intro,
      status: 'PENDING',
      ownerId: req.user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    hotels.push(newHotel);
    persistRuntimeEntityData();
    
    res.status(201).json({
      success: true,
      data: newHotel,
      message: '酒店创建成功'
    });
  } catch (error) {
    console.error('创建酒店错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 9. 更新酒店（需要酒店所有者或管理员）
app.put('/api/hotels/:id', authMiddleware, (req, res) => {
  try {
    const hotel = hotels.find(h => h.id === req.params.id);

    if (!hotel) {
      return res.status(404).json({ success: false, message: '酒店不存在' });
    }

    if (!canManageHotel(hotel, req.user)) {
      return res.status(403).json({ success: false, message: '无权修改该酒店' });
    }

    const {
      name,
      city,
      address,
      description,
      star,
      tags,
      price,
      promo,
      coverImage,
      intro,
      status,
    } = req.body || {};

    if (name !== undefined) hotel.name = name;
    if (city !== undefined) hotel.city = city;
    if (address !== undefined) hotel.address = address;
    if (description !== undefined) hotel.description = description;
    if (star !== undefined) hotel.star = star;
    if (Array.isArray(tags)) hotel.tags = tags;
    if (price !== undefined) hotel.price = Number(price);
    if (promo !== undefined) hotel.promo = promo;
    if (coverImage !== undefined) hotel.coverImage = coverImage;
    if (intro !== undefined) hotel.intro = intro;

    if (status !== undefined) {
      const normalizedStatus = normalizeHotelStatus(status);
      if (!normalizedStatus) {
        return res.status(400).json({ success: false, message: '无效的酒店状态' });
      }

      if (normalizedStatus !== hotel.status && req.user.role !== 'ADMIN') {
        const ownerAllowedStatuses = ['DRAFT', 'PENDING'];
        if (!ownerAllowedStatuses.includes(normalizedStatus)) {
          return res.status(403).json({ success: false, message: '无权设置该酒店状态' });
        }
      }

      hotel.status = normalizedStatus;
    }

    hotel.updatedAt = new Date().toISOString();
    persistRuntimeEntityData();

    res.json({
      success: true,
      data: hotel,
      message: '酒店更新成功',
    });
  } catch (error) {
    console.error('更新酒店错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 10. 删除酒店（需要酒店所有者或管理员）
app.delete('/api/hotels/:id', authMiddleware, (req, res) => {
  try {
    const hotelIndex = hotels.findIndex(h => h.id === req.params.id);

    if (hotelIndex === -1) {
      return res.status(404).json({ success: false, message: '酒店不存在' });
    }

    const hotel = hotels[hotelIndex];
    if (!canManageHotel(hotel, req.user)) {
      return res.status(403).json({ success: false, message: '无权删除该酒店' });
    }

    const [deletedHotel] = hotels.splice(hotelIndex, 1);

    for (let index = rooms.length - 1; index >= 0; index -= 1) {
      if (rooms[index].hotelId === deletedHotel.id) {
        rooms.splice(index, 1);
      }
    }
    persistRuntimeEntityData();

    res.json({
      success: true,
      data: deletedHotel,
      message: '酒店删除成功',
    });
  } catch (error) {
    console.error('删除酒店错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 11. 提交酒店审核（酒店所有者或管理员）
app.post('/api/hotels/:id/submit', authMiddleware, (req, res) => {
  const hotel = hotels.find(h => h.id === req.params.id);

  if (!hotel) {
    return res.status(404).json({ success: false, message: '酒店不存在' });
  }

  if (!canManageHotel(hotel, req.user)) {
    return res.status(403).json({ success: false, message: '无权提交该酒店' });
  }

  if (hotel.status === 'APPROVED') {
    return res.status(400).json({ success: false, message: '已审核通过的酒店无需重复提交' });
  }

  hotel.status = 'PENDING';
  hotel.updatedAt = new Date().toISOString();
  persistRuntimeEntityData();

  res.json({
    success: true,
    data: hotel,
    message: '酒店已提交审核',
  });
});

// 12. 发布酒店（酒店所有者或管理员）
app.post('/api/hotels/:id/publish', authMiddleware, (req, res) => {
  const hotel = hotels.find(h => h.id === req.params.id);

  if (!hotel) {
    return res.status(404).json({ success: false, message: '酒店不存在' });
  }

  if (!canManageHotel(hotel, req.user)) {
    return res.status(403).json({ success: false, message: '无权发布该酒店' });
  }

  hotel.status = 'APPROVED';
  hotel.updatedAt = new Date().toISOString();
  persistRuntimeEntityData();

  res.json({
    success: true,
    data: hotel,
    message: '酒店已发布',
  });
});

// 13. 下线酒店（酒店所有者或管理员）
app.post('/api/hotels/:id/offline', authMiddleware, (req, res) => {
  const hotel = hotels.find(h => h.id === req.params.id);

  if (!hotel) {
    return res.status(404).json({ success: false, message: '酒店不存在' });
  }

  if (!canManageHotel(hotel, req.user)) {
    return res.status(403).json({ success: false, message: '无权下线该酒店' });
  }

  hotel.status = 'DRAFT';
  hotel.updatedAt = new Date().toISOString();
  persistRuntimeEntityData();

  res.json({
    success: true,
    data: hotel,
    message: '酒店已下线',
  });
});

// 14. 获取酒店房型（公开接口，登录后酒店所有者/管理员可看全部状态）
app.get('/api/hotels/:id/rooms', optionalAuthMiddleware, (req, res) => {
  if (req.authTokenInvalid) {
    return res.status(401).json({ success: false, message: '认证令牌无效，请重新登录' });
  }

  const hotel = hotels.find(h => h.id === req.params.id);

  if (!hotel) {
    return res.status(404).json({ success: false, message: '酒店不存在' });
  }

  const isAdmin = req.user && req.user.role === 'ADMIN';
  const isOwner = req.user && hotel.ownerId === req.user.uid;
  const canViewAllRooms = isAdmin || isOwner;

  const hotelRooms = rooms.filter((room) => {
    if (room.hotelId !== req.params.id) {
      return false;
    }

    return canViewAllRooms ? true : room.status === 'ON';
  });
  
  res.json({
    success: true,
    data: hotelRooms
  });
});

// 获取我的酒店（当前登录用户创建的酒店）
app.get('/api/hotels/my/list', authMiddleware, (req, res) => {
  try {
    // 从 token 中获取用户ID
    const userId = req.user.uid;
    
    // 过滤出当前用户创建的酒店
    const myHotels = hotels.filter(hotel => hotel.ownerId === userId);
    
    res.json({
      success: true,
      data: {
        list: myHotels,
        total: myHotels.length,
      },
      total: myHotels.length,
    });
  } catch (error) {
    console.error('获取我的酒店错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 10. 添加房型（需要酒店所有者或管理员）
app.post('/api/hotels/:id/rooms', authMiddleware, (req, res) => {
  try {
    const hotel = hotels.find(h => h.id === req.params.id);
    
    if (!hotel) {
      return res.status(404).json({ success: false, message: '酒店不存在' });
    }
    
    // 权限检查
    const isAdmin = req.user.role === 'ADMIN';
    const isOwner = hotel.ownerId === req.user.uid;
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: '无权为此酒店添加房型' });
    }
    
    const { name, price, stock, description, facilities } = req.body;
    
    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ success: false, message: '名称、价格和库存是必填项' });
    }
    
    const newRoom = {
      id: `r-${(rooms.length + 1).toString().padStart(3, '0')}`,
      hotelId: req.params.id,
      name,
      price: Number(price),
      stock: Number(stock),
      description,
      facilities: facilities || [],
      status: 'ON',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    rooms.push(newRoom);
    persistRuntimeEntityData();
    
    res.status(201).json({
      success: true,
      data: newRoom,
      message: '房型创建成功'
    });
  } catch (error) {
    console.error('创建房型错误:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// 16. 获取单个房型详情（需要酒店所有者或管理员）
app.get('/api/rooms/:id', authMiddleware, (req, res) => {
  const room = rooms.find(item => item.id === req.params.id);

  if (!room) {
    return res.status(404).json({ success: false, message: '房型不存在' });
  }

  const hotel = hotels.find(item => item.id === room.hotelId);
  if (!hotel) {
    return res.status(404).json({ success: false, message: '所属酒店不存在' });
  }

  if (!canManageHotel(hotel, req.user)) {
    return res.status(403).json({ success: false, message: '无权查看该房型' });
  }

  res.json({
    success: true,
    data: room,
  });
});

// 17. 更新房型（需要酒店所有者或管理员）
app.put('/api/rooms/:id', authMiddleware, (req, res) => {
  const room = rooms.find(item => item.id === req.params.id);

  if (!room) {
    return res.status(404).json({ success: false, message: '房型不存在' });
  }

  const hotel = hotels.find(item => item.id === room.hotelId);
  if (!hotel) {
    return res.status(404).json({ success: false, message: '所属酒店不存在' });
  }

  if (!canManageHotel(hotel, req.user)) {
    return res.status(403).json({ success: false, message: '无权修改该房型' });
  }

  const { name, price, stock, description, facilities, status } = req.body || {};

  if (name !== undefined) room.name = name;
  if (price !== undefined) room.price = Number(price);
  if (stock !== undefined) room.stock = Number(stock);
  if (description !== undefined) room.description = description;
  if (Array.isArray(facilities)) room.facilities = facilities;
  if (status === 'ON' || status === 'OFF') room.status = status;
  room.updatedAt = new Date().toISOString();
  persistRuntimeEntityData();

  res.json({
    success: true,
    data: room,
    message: '房型更新成功',
  });
});

// 18. 删除房型（需要酒店所有者或管理员）
app.delete('/api/rooms/:id', authMiddleware, (req, res) => {
  const roomIndex = rooms.findIndex(item => item.id === req.params.id);

  if (roomIndex === -1) {
    return res.status(404).json({ success: false, message: '房型不存在' });
  }

  const room = rooms[roomIndex];
  const hotel = hotels.find(item => item.id === room.hotelId);

  if (!hotel) {
    return res.status(404).json({ success: false, message: '所属酒店不存在' });
  }

  if (!canManageHotel(hotel, req.user)) {
    return res.status(403).json({ success: false, message: '无权删除该房型' });
  }

  const [deletedRoom] = rooms.splice(roomIndex, 1);
  persistRuntimeEntityData();

  res.json({
    success: true,
    data: deletedRoom,
    message: '房型删除成功',
  });
});

// 19. 更新房型库存（需要酒店所有者或管理员）
app.patch('/api/rooms/:id/stock', authMiddleware, (req, res) => {
  const room = rooms.find(item => item.id === req.params.id);

  if (!room) {
    return res.status(404).json({ success: false, message: '房型不存在' });
  }

  const hotel = hotels.find(item => item.id === room.hotelId);
  if (!hotel) {
    return res.status(404).json({ success: false, message: '所属酒店不存在' });
  }

  if (!canManageHotel(hotel, req.user)) {
    return res.status(403).json({ success: false, message: '无权修改该房型库存' });
  }

  const { quantity } = req.body || {};
  if (quantity === undefined || Number.isNaN(Number(quantity)) || Number(quantity) < 0) {
    return res.status(400).json({ success: false, message: '库存数量不合法' });
  }

  room.stock = Number(quantity);
  room.updatedAt = new Date().toISOString();
  persistRuntimeEntityData();

  res.json({
    success: true,
    data: room,
    message: '库存更新成功',
  });
});

// 11. 管理员接口：获取所有酒店（包括未审核的）
app.get('/api/admin/hotels', authMiddleware, (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: '权限不足' });
  }
  
  res.json({
    success: true,
    data: {
      list: hotels,
      total: hotels.length,
    },
    total: hotels.length,
  });
});

// 12. 管理员接口：审核酒店
app.post('/api/admin/hotels/:id/approve', authMiddleware, (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: '权限不足' });
  }
  
  const hotel = hotels.find(h => h.id === req.params.id);
  
  if (!hotel) {
    return res.status(404).json({ success: false, message: '酒店不存在' });
  }
  
  if (hotel.status !== 'PENDING') {
    return res.status(400).json({ success: false, message: '只有待审核状态的酒店可以审核' });
  }
  
  hotel.status = 'APPROVED';
  hotel.updatedAt = new Date().toISOString();
  persistRuntimeEntityData();
  
  res.json({
    success: true,
    data: hotel,
    message: '酒店审核通过'
  });
});

// 13. 管理员接口：拒绝酒店
app.post('/api/admin/hotels/:id/reject', authMiddleware, (req, res) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: '权限不足' });
  }
  
  const hotel = hotels.find(h => h.id === req.params.id);
  
  if (!hotel) {
    return res.status(404).json({ success: false, message: '酒店不存在' });
  }
  
  if (hotel.status !== 'PENDING') {
    return res.status(400).json({ success: false, message: '只有待审核状态的酒店可以拒绝' });
  }
  
  hotel.status = 'REJECTED';
  hotel.updatedAt = new Date().toISOString();
  persistRuntimeEntityData();
  
  res.json({
    success: true,
    data: hotel,
    message: '酒店审核已拒绝'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('='.repeat(70));
  console.log('🚀 易宿平台 API 服务器启动成功！');
  console.log('='.repeat(70));
  console.log(`📡 服务器地址: http://localhost:${PORT}`);
  console.log('');
  console.log('🎯 主要接口:');
  console.log(`   首页: http://localhost:${PORT}/`);
  console.log(`   所有酒店: http://localhost:${PORT}/api/hotels`);
  console.log(`   深圳酒店: http://localhost:${PORT}/api/hotels?city=深圳`);
  console.log(`   搜索酒店: http://localhost:${PORT}/api/hotels?keyword=海景`);
  console.log(`   酒店详情: http://localhost:${PORT}/api/hotels/h-001`);
  console.log(`   酒店房型: http://localhost:${PORT}/api/hotels/h-001/rooms`);
  console.log(`   用户端酒店列表: http://localhost:${PORT}/api/user/hotels?pageNo=1&pageSize=10`);
  console.log(`   用户端酒店详情: http://localhost:${PORT}/api/user/hotels/h-001/detail`);
  console.log('');
  console.log('🔐 认证接口:');
  console.log(`   登录: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`        {"username": "admin", "password": "admin123"}`);
  console.log(`   注册: POST http://localhost:${PORT}/api/auth/register`);
  console.log(`        {"username": "test", "password": "test123"}`);
  console.log('');
  console.log('👑 管理员接口:');
  console.log(`   所有酒店(含未审核): GET http://localhost:${PORT}/api/admin/hotels`);
  console.log(`   审核酒店: POST http://localhost:${PORT}/api/admin/hotels/h-003/approve`);
  console.log(`   拒绝酒店: POST http://localhost:${PORT}/api/admin/hotels/h-003/reject`);
  console.log('='.repeat(70));
});
