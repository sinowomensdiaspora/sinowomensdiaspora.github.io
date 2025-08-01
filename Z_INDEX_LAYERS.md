# Z-Index 层级结构文档

## 当前层级设置

### 地图页面 (Map.js)
1. **地图容器 (MapContainer)**: 默认层级 (最低)
2. **添加故事按钮**: z-index: 50
   - 位置: 屏幕中央
   - 在地图之上，但在筛选框之下
3. **筛选框容器**: z-index: 200
   - 位置: 顶部
   - 在添加故事按钮之上，但在Header/Footer之下
4. **回执弹窗 (Dialog)**: z-index: 1300
   - 在所有元素之上

### 全局组件
1. **Header**: z-index: 1100
2. **Footer**: z-index: 1100

### 其他页面
1. **StoryArchive 浮动气球**: z-index: 10
2. **StoryArchive 页面标题**: z-index: 1000

## 层级顺序 (从低到高)
1. 地图 (默认)
2. StoryArchive 浮动气球 (10)
3. 添加故事按钮 (50)
4. 筛选框 (200)
5. StoryArchive 页面标题 (1000)
6. Header/Footer (1100)
7. Dialog/Modal (1300)

## 预期行为
- ✅ 添加故事按钮在地图之上显示
- ✅ 筛选框在添加故事按钮之上显示
- ✅ Header/Footer在筛选框之上显示
- ✅ Dialog弹窗在所有元素之上显示
- ✅ 点击气球后的详情预览(IncidentInfo页面)正常显示(独立页面，不涉及z-index冲突)

## 修改记录
- 添加故事按钮: 从 z-index: 9999 调整为 z-index: 50
- 筛选框: 从 z-index: 100 调整为 z-index: 200
- 回执弹窗: 明确设置 z-index: 1300
