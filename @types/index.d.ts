interface User {
    id: number,
	account: string, // 账号
	email: string, // 邮箱
	tel: string, // 手机号
	passwd: string, // 密码
	name: string, // 用户名
	avatar: string, // 头像
	profile: string, // 简介
	role: string, // 角色
	money: number, // 总币数
	mCost: number, // 已使用币数
	invite_id: number, // 邀请人
	create_at: number, // 注册时间
	invite_code: string, // 邀请码
	teams: Team[]
}

interface Team {
	id: number,
	create_id: number,  // 创建者
	name: string,  // 团队名
	jobs: string,  // 岗位清单，默认:"管理,产品,开发,测试,内容,运维,客服,销售"
	q: string,  // 问题,加入团队需要回答
	a: string,  // 答案,加入团队问题的答案
	audit: number,  // 是否需要审核
}

interface ENode {
	id: number,
	create_id: number,  // 创建者
	edit_id: number,  // 最近修改人
	parent_id: number, // 父节点ID
	path: string,  // 路径(不含自身)：/1/2/34/
	state: number,  // 状态:0=禁用 1=可用
	title: string,  // 标题
	taskSum: number,  // 本节点子任务总数
	taskOk: number,  // 本节点已完成任务数
	percent: number,  // 本节点完成度[0,100]
	create_at: number,  // 创建时间
	update_at: number,  // 更新时间（节点直属信息变化(发布、修改、删除、回复、主题移入、主题移出)，初始同创建时间）
	subChg_at: number,  // 子树最近修改时间（子树节点中nTChg最大的一个,0表示没有子节点)
	subDel_at: number,  // 最近删除/移走后代节点的时间
	plan_at: number,  // 计划完成时间
	minPlan_at: number,  // 子树中未完成的主题中的计划时间最早的一个
	pow: number,
	visit_at: number,
	pIDs: number[],
	share: Boolean, // 权限 是否来自共享
}

interface ENodeUser {
	node_id: number,  // 节点ID
	user_id: number,  // 用户ID
	visit_at: number,  // 最近打开时间（此用户获取了节点信息）
	pow: number,  // 权限：0x01-可见 0x02-查看 0x04-下载 0x08-回复 0x10-发布 0x20-修改 0x40-管理 0x100=删除 null-继承父结点权限
	loc: string,  // 定位路径(包含自身node_id)：/1/2/34/,为了复杂的检索
}

interface Post {
	id: number, 
	create_id: number,  // 创建者
	type: number,  // 类别(10=闲聊 20=资料 100=其他非代码类任务 150=定义 160=设计 210=改进 220=新功能 230=测试 240=bug)
	top: number,  // 置顶序号
	node_id: number,  // 关联节点ID
	title: string,  // 标题
	create_at: number,  // 创建时间
	update_at: number,  // 最近修改时间
	edit_id: number,  // 最近修改人id(任何修改，包括移动)
	reply_at: number,  // 最近被回复时间
	head_id: number,  // 负责人ID,0表示不是任务，无需负责人
	plan_at: number,  // 计划完成时间,创建人填写，负责人改写
	percent: number,  // 进度,[0,100]，负责人改写
	attCnt: number,  // 附件数量
	open_at: number,
	called_at: number,
	follow_at: number,
	getNode: ()=>Promise<ENode>
}

interface Reply {
	id: number, 
	post_id: number,  // 关联主题帖子ID
	reply_id: number,  // 所回复的回复帖子ID
	create_id: number,  // 发布用户ID
	edit_id: number,  // 最近修改人id
	create_at: number,  // 创建时间
	update_at: number,  // 最近修改时间
	txt: string,  // 内容html文本
}
