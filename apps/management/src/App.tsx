import './App.css'

const metrics = [
  { label: '今日交易额', value: '286,420', delta: '+12.8%', tone: 'cyan' },
  { label: '新增用户', value: '1,284', delta: '+6.4%', tone: 'violet' },
  { label: '待处理工单', value: '37', delta: '-18.2%', tone: 'emerald' },
  { label: '风险订单', value: '9', delta: '+2.1%', tone: 'amber' },
]

const channels = [
  { name: '私域会员', share: 78, amount: '92.6k' },
  { name: '渠道分销', share: 61, amount: '74.4k' },
  { name: '电商直营', share: 54, amount: '63.1k' },
  { name: '线下门店', share: 36, amount: '29.8k' },
]

const orders = [
  {
    id: 'SO-20260318-001',
    customer: '杭州星链科技',
    amount: '68,400',
    status: '已支付',
    delivery: '待发货',
  },
  {
    id: 'SO-20260318-014',
    customer: '青岛元一商贸',
    amount: '15,820',
    status: '已完成',
    delivery: '已签收',
  },
  {
    id: 'SO-20260318-029',
    customer: '重庆叁陆零门店',
    amount: '6,960',
    status: '退款中',
    delivery: '处理中',
  },
  {
    id: 'SO-20260318-041',
    customer: '深圳沐光信息',
    amount: '32,600',
    status: '已支付',
    delivery: '备货中',
  },
]

const todos = [
  { title: '审批退款申请 12 条', owner: '财务中心', due: '今天 18:00 前' },
  { title: '核验华东区库存波动', owner: '供应链组', due: '今天 20:30 前' },
  { title: '同步会员节活动方案', owner: '增长团队', due: '明天 10:00' },
]

function App() {
  return (
    <div className="console-shell">
      <aside className="sidebar">
        <div className="brand-card">
          <div className="brand-mark">MC</div>
          <div>
            <p className="eyebrow">Management</p>
            <h1>Console</h1>
          </div>
        </div>

        <nav className="menu">
          <button className="menu-item active">
            <span>仪表盘</span>
            <small>经营指标与待办总览</small>
          </button>
          <button className="menu-item">
            <span>用户管理</span>
            <small>账号、角色与分层运营</small>
          </button>
          <button className="menu-item">
            <span>订单中心</span>
            <small>订单流转与履约状态</small>
          </button>
          <button className="menu-item">
            <span>经营分析</span>
            <small>转化、收入与区域趋势</small>
          </button>
          <button className="menu-item">
            <span>系统设置</span>
            <small>通知策略与审批配置</small>
          </button>
        </nav>

        <div className="sidebar-panel">
          <p className="eyebrow">初始化说明</p>
          <p>
            这是一个已经替换完成的后台管理首页骨架，后续你可以直接接入接口、权限和路由。
          </p>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">控制台 / 仪表盘</p>
            <h2>今天有 6 个关键节点待关注</h2>
          </div>
          <div className="topbar-actions">
            <input className="search" placeholder="搜索用户、订单或模块" />
            <button className="primary-btn">新建工作流</button>
          </div>
        </header>

        <section className="hero-panel">
          <div>
            <p className="eyebrow">实时经营态势</p>
            <h3>经营整体健康，转化提升，库存与退款链路仍需优先处理</h3>
          </div>
          <div className="hero-tag">实时同步中</div>
        </section>

        <section className="metric-grid">
          {metrics.map((item) => (
            <article key={item.label} className={`metric-card tone-${item.tone}`}>
              <p>{item.label}</p>
              <strong>{item.value}</strong>
              <span>{item.delta} vs 昨日</span>
            </article>
          ))}
        </section>

        <section className="layout-grid">
          <article className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">渠道表现</p>
                <h3>核心渠道成交贡献</h3>
              </div>
            </div>
            <div className="channel-list">
              {channels.map((item) => (
                <div key={item.name} className="channel-row">
                  <div className="channel-meta">
                    <span>{item.name}</span>
                    <small>{item.amount}</small>
                  </div>
                  <div className="progress">
                    <div style={{ width: `${item.share}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">今日待办</p>
                <h3>建议按优先级依次处理</h3>
              </div>
            </div>
            <div className="todo-list">
              {todos.map((item) => (
                <div key={item.title} className="todo-card">
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.owner}</p>
                  </div>
                  <span>{item.due}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">订单中心</p>
              <h3>最新订单列表</h3>
            </div>
            <button className="ghost-btn">导出报表</button>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>订单号</th>
                  <th>客户</th>
                  <th>金额</th>
                  <th>支付状态</th>
                  <th>履约状态</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customer}</td>
                    <td>{order.amount}</td>
                    <td>
                      <span className={`status status-${order.status}`}>{order.status}</span>
                    </td>
                    <td>{order.delivery}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
