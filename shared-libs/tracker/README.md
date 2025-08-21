# 微信小程序事件追踪器 (Tracker)

这是一个独立的事件追踪器模块，用于微信小程序的数据埋点和上报。支持批量上报、失败重试、本地缓存等功能。

## 文件说明

- `tracker.js` - 完整版本，支持多种环境（微信小程序、浏览器、Node.js等）
- `tracker-simple.js` - 简化版本，专门用于微信小程序环境

## 使用方法

### 1. 在微信小程序中使用

#### 方式一：直接复制文件
将 `tracker-simple.js` 文件复制到你的项目中，然后：

```javascript
// 引入追踪器
const tracker = require('./utils/tracker-simple.js');

// 初始化
tracker.init({
  device_info: {
    brand: 'iPhone',
    model: 'iPhone 14',
    platform: 'ios',
    system: 'iOS 16.0'
  },
  user_info: {
    openid: 'your_openid',
    userid: 12345
  }
});

// 使用追踪器
tracker.log('page_view', { page_name: 'home' });
tracker.report('button_click', { button_name: 'submit' });
```

#### 方式二：使用完整版本
将 `tracker.js` 文件复制到你的项目中，然后：

```javascript
// 引入追踪器
const tracker = require('./utils/tracker.js');

// 初始化
tracker.init({
  device_info: {
    brand: 'iPhone',
    model: 'iPhone 14',
    platform: 'ios',
    system: 'iOS 16.0'
  },
  user_info: {
    openid: 'your_openid',
    userid: 12345
  }
});

// 使用追踪器
tracker.log('page_view', { page_name: 'home' });
tracker.report('button_click', { button_name: 'submit' });
```

### 2. 在其他项目中使用

#### Node.js 环境
```javascript
const Tracker = require('./tracker.js');

// 初始化
Tracker.init({
  app_name: 'my_app',
  version: '1.0.0'
});

// 使用
Tracker.log('user_action', { action: 'login' });
```

#### 浏览器环境
```html
<script src="./tracker.js"></script>
<script>
// 初始化
Tracker.init({
  app_name: 'my_app',
  version: '1.0.0'
});

// 使用
Tracker.log('user_action', { action: 'login' });
</script>
```

## API 说明

### 初始化
```javascript
tracker.init(params)
```
- `params`: 公共参数对象，包含设备信息、用户信息等

### 立即上报
```javascript
tracker.report(event, properties)
```
- `event`: 事件ID（字符串）
- `properties`: 事件属性（对象，可选）

### 批量上报
```javascript
tracker.log(event, properties)
```
- `event`: 事件ID（字符串）
- `properties`: 事件属性（对象，可选）
- 事件会被缓存，达到20条或10秒后自动批量发送

### 手动刷新
```javascript
tracker.manualFlush()
```
- 手动触发缓存事件的发送

### 清理资源
```javascript
tracker.destroy()
```
- 清理定时器等资源

## 配置说明

### 上报接口
默认上报接口为：`https://gewugo.com/api/report/log/batch`

如需修改，请编辑 `sendBatch` 方法中的 URL。

### 缓存配置
- 最大缓存事件数：20条
- 自动刷新间隔：10秒
- 存储键名：`event_queue`

## 注意事项

1. **微信小程序环境**：确保在 `app.json` 中配置了网络请求权限
2. **存储权限**：追踪器使用 `wx.setStorage` 和 `wx.getStorage` 进行本地缓存
3. **网络请求**：追踪器使用 `wx.request` 进行数据上报
4. **页面信息**：使用 `getCurrentPages()` 获取当前页面信息，确保在页面生命周期中调用

## 示例场景

### 页面访问埋点
```javascript
// 在页面的 onShow 生命周期中
onShow() {
  tracker.log('page_view', {
    page_name: 'home',
    page_title: '首页'
  });
}
```

### 按钮点击埋点
```javascript
handleButtonClick() {
  tracker.report('button_click', {
    button_name: 'submit',
    button_type: 'primary',
    page_name: 'form'
  });
}
```

### 用户行为埋点
```javascript
handleUserAction() {
  tracker.log('user_action', {
    action: 'scroll',
    direction: 'down',
    scroll_distance: 100
  });
}
```

## 故障排除

### 常见问题

1. **事件未上报**：检查网络权限和接口地址
2. **缓存不生效**：检查存储权限和键名冲突
3. **页面信息获取失败**：确保在正确的生命周期中调用

### 调试模式
追踪器会输出详细的日志信息，可以通过控制台查看运行状态。

## 更新日志

- v1.0.0: 初始版本，支持基本的事件追踪和上报功能
- v1.1.0: 添加了环境检测和兼容性支持
- v1.2.0: 优化了错误处理和日志输出
