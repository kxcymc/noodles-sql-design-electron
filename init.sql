-- 用户信息表
CREATE TABLE IF NOT EXISTS EveryInfo (
  Mytel TEXT PRIMARY KEY NOT NULL,
  Password TEXT,
  Limitid INTEGER NOT NULL,
  Waitername TEXT,
  FOREIGN KEY (Limitid) REFERENCES Characterlimit (Typeid)
);

-- 插入数据时避免重复
INSERT OR IGNORE INTO EveryInfo (Mytel, Password, Limitid) 
VALUES ('18888888888', '2233445566', 1);

INSERT OR IGNORE INTO EveryInfo (Mytel, Limitid) 
VALUES
('13812345678', 3),
('13912345679', 3),
('13712345680', 3),
('13612345681', 3),
('13512345682', 3);

-- 其他表和插入语句保持不变
-- 菜品类别表
CREATE TABLE IF NOT EXISTS Menucate (
  Cateid INTEGER PRIMARY KEY AUTOINCREMENT,
  Catename TEXT
);

INSERT OR IGNORE INTO Menucate(Catename)
VALUES 
('主食'),
('小吃'),
('饮料');

-- 菜单表
CREATE TABLE IF NOT EXISTS Menu (
  Foodid INTEGER PRIMARY KEY AUTOINCREMENT,
  Food TEXT NOT NULL,
  Cateid INTEGER,
  Remain INTEGER NOT NULL,
  Price REAL NOT NULL,
  FOREIGN KEY (Cateid) REFERENCES Menucate (Cateid) ON DELETE SET NULL
);

INSERT OR IGNORE INTO Menu(Food, Cateid, Remain, Price)
VALUES
('油泼面', 1, 100, 18.0),
('肉夹馍', 1, 80, 9.99),
('刀削面', 1, 120, 15.0),
('五味裤带面', 1, 90, 23.88),
('陕西凉皮', 1, 110, 8.0),
('羊肉臊子面', 1, 95, 19.0),
('羊肉泡馍', 1, 85, 25.0),
('酸菜肉沫面', 1, 100, 14.99),
('红油抄手', 1, 130, 12.5),
('红烧牛肉面', 1, 100, 19.99),
('黄花菜炒蛋', 1, 80, 8.5),
('西红柿炒蛋面', 1, 110, 6.5),
('酸辣粉', 1, 120, 8.88),
('水盆羊肉', 1, 90, 29.99),
('猪肉丸', 2, 100, 5.0),
('馕儿', 2, 80, 0.99),
('青椒小炒肉', 2, 120, 18.0),
('羊肉串', 2, 110, 6.66),
('牛肉串', 2, 85, 5.0),
('牛筋面', 2, 90, 18.88),
('不安好心的油条', 2, 100, 2.0),
('蜜雪冰城柠檬水', 3, 120, 10.0),
('我没KFC热豆浆', 3, 100, 6.0),
('可口可乐', 3, 200, 3.0),
('百事雪碧', 3, 180, 3.0),
('美汁源橙汁', 3, 150, 3.0);

-- 订单状态表
CREATE TABLE IF NOT EXISTS Orderstatus (
  Statusid INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  Statusname TEXT NOT NULL
);

INSERT OR IGNORE INTO Orderstatus (Statusname)
VALUES 
('已支付'),
('正在制作'),
('已完成'),
('退款成功');

-- 订单关键信息表
CREATE TABLE IF NOT EXISTS Orderform (
  Orderid INTEGER PRIMARY KEY NOT NULL,
  Mytel TEXT,
  Orderday DATETIME DEFAULT CURRENT_TIMESTAMP,
  Totalprice REAL NOT NULL,
  Statusid INTEGER NOT NULL DEFAULT 1,
  Score INTEGER,
  Visibility TEXT NOT NULL DEFAULT '1',
  FOREIGN KEY (Statusid) REFERENCES Orderstatus(Statusid),
  FOREIGN KEY (Mytel) REFERENCES EveryInfo(Mytel) ON DELETE SET NULL
);

-- 订单详情表
CREATE TABLE IF NOT EXISTS OrderDetails (
  OrderDetailId INTEGER PRIMARY KEY AUTOINCREMENT,
  Orderid INTEGER NOT NULL,
  Foodid INTEGER,
  Ordercount INTEGER NOT NULL,
  Score INTEGER,
  FOREIGN KEY (Orderid) REFERENCES Orderform(Orderid) ON DELETE CASCADE,
  FOREIGN KEY (Foodid) REFERENCES Menu(Foodid) ON DELETE SET NULL
);

-- 插入 Orderform 表
INSERT OR IGNORE INTO Orderform (Orderid, Mytel, Totalprice)
VALUES
(1, '13812345678', 105.88),
(2, '13812345678', 89.99),
(3, '13812345678', 78.88),
(4, '13812345678', 97.5),
(5, '13812345678', 120.0);

-- 插入 OrderDetails 表
INSERT OR IGNORE INTO OrderDetails (Orderid, Foodid, Ordercount)
VALUES
(1, 1, 2),  -- 油泼面 x 2
(1, 2, 1),  -- 肉夹馍 x 1
(1, 3, 1),  -- 刀削面 x 1
(2, 1, 1),  -- 油泼面 x 1
(2, 4, 2),  -- 五味裤带面 x 2
(2, 5, 1),  -- 陕西凉皮 x 1
(3, 6, 1),  -- 羊肉臊子面 x 1
(3, 7, 1),  -- 羊肉泡馍 x 1
(3, 8, 1),  -- 酸菜肉沫面 x 1
(4, 9, 2),  -- 红油抄手 x 2
(4, 10, 1), -- 红烧牛肉面 x 1
(4, 11, 1), -- 黄花菜炒蛋 x 1
(5, 12, 1), -- 西红柿炒蛋面 x 1
(5, 13, 1), -- 酸辣粉 x 1
(5, 14, 2); -- 水盆羊肉 x 2