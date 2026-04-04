/**
 * 动作配置文件
 * 只控制身体、尾巴等动作参数，不控制表情
 * 表情由 Live2D 的 playExpressions 控制
 */

export interface ActionParam {
  id: string // Live2D 参数 ID
  base: number // 基础值
  amplitude: number // 振幅
  frequency: number // 频率倍数
}

export interface ActionConfig {
  speed: number // 动画速度 (phase 增量)
  interval: number // 更新间隔 (ms)
  params: ActionParam[] // 参数列表
}

/**
 * 可用的动作参数 ID（仅身体/尾巴相关）:
 *
 * 头部角度:
 * - ParamAngleX: 点头 (上下)
 * - ParamAngleY: 摇头 (左右)
 * - ParamAngleZ: 歪头 (倾斜)
 *
 * 身体角度:
 * - ParamBodyAngleX: 身体前后
 * - ParamBodyAngleY: 身体左右
 * - ParamBodyAngleZ: 身体扭转
 *
 * 尾巴:
 * - Param14: tail_breath1 (尾巴根部)
 * - Param15: tail_breath2
 * - Param16: tail_breath3
 * - Param17: tail_breath4
 * - Param18: tail_breath5 (尾巴尖端)
 *
 * 物理尾巴:
 * - Param_Angle_Rotation4-8: cat_tail_phy
 */

export const actionConfigs: Record<string, ActionConfig> = {
  // 思考：歪头 + 尾巴轻摆
  thinking: {
    speed: 0.06,
    interval: 50,
    params: [
      { id: 'ParamAngleZ', base: 20, amplitude: 12, frequency: 1 },
      { id: 'ParamAngleY', base: 10, amplitude: 8, frequency: 0.7 },
      { id: 'Param14', base: 0, amplitude: 20, frequency: 0.5 },
      { id: 'Param15', base: 0, amplitude: 16, frequency: 0.5 },
    ],
  },

  // 编码：点头 + 尾巴慢摆
  coding: {
    speed: 0.08,
    interval: 50,
    params: [
      { id: 'ParamAngleX', base: -8, amplitude: 6, frequency: 1 },
      { id: 'ParamAngleY', base: 0, amplitude: 4, frequency: 0.6 },
      { id: 'Param14', base: 0, amplitude: 12, frequency: 0.3 },
    ],
  },

  // 阅读：头部轻微移动 + 尾巴轻摆
  reading: {
    speed: 0.1,
    interval: 50,
    params: [
      { id: 'ParamAngleX', base: -5, amplitude: 3, frequency: 0.5 },
      { id: 'ParamAngleY', base: 0, amplitude: 8, frequency: 0.4 },
      { id: 'Param14', base: 0, amplitude: 10, frequency: 0.3 },
    ],
  },

  // 运行：身体抖动 + 尾巴快速摇摆
  running: {
    speed: 0.25,
    interval: 40,
    params: [
      { id: 'ParamBodyAngleY', base: 0, amplitude: 8, frequency: 1 },
      { id: 'ParamBodyAngleX', base: 0, amplitude: 5, frequency: 1.5 },
      { id: 'ParamAngleZ', base: 0, amplitude: 8, frequency: 0.8 },
      { id: 'Param14', base: 0, amplitude: 30, frequency: 2.5 },
      { id: 'Param15', base: 0, amplitude: 27, frequency: 2.5 },
      { id: 'Param16', base: 0, amplitude: 24, frequency: 2.5 },
    ],
  },

  // 庆祝：大幅度摇头 + 尾巴疯狂摆动
  celebrate: {
    speed: 0.12,
    interval: 40,
    params: [
      { id: 'ParamAngleZ', base: 0, amplitude: 25, frequency: 1 },
      { id: 'ParamAngleY', base: 0, amplitude: 15, frequency: 0.7 },
      { id: 'ParamBodyAngleY', base: 0, amplitude: 5, frequency: 1.2 },
      { id: 'Param14', base: 0, amplitude: 35, frequency: 2 },
      { id: 'Param15', base: 0, amplitude: 32, frequency: 2 },
      { id: 'Param16', base: 0, amplitude: 28, frequency: 2 },
      { id: 'Param17', base: 0, amplitude: 24, frequency: 2 },
    ],
  },

  // 错误：低头 + 尾巴下垂慢摆
  error: {
    speed: 0.04,
    interval: 50,
    params: [
      { id: 'ParamAngleZ', base: -12, amplitude: 6, frequency: 1 },
      { id: 'ParamAngleX', base: 8, amplitude: 4, frequency: 0.5 },
      { id: 'Param14', base: -10, amplitude: 5, frequency: 0.3 },
      { id: 'Param15', base: -8, amplitude: 4, frequency: 0.3 },
    ],
  },

  // 失败：更低头 + 尾巴下垂
  failed: {
    speed: 0.03,
    interval: 50,
    params: [
      { id: 'ParamAngleZ', base: -18, amplitude: 4, frequency: 0.8 },
      { id: 'ParamAngleX', base: 12, amplitude: 3, frequency: 0.4 },
      { id: 'ParamBodyAngleX', base: 5, amplitude: 2, frequency: 0.3 },
      { id: 'Param14', base: -15, amplitude: 3, frequency: 0.2 },
      { id: 'Param15', base: -12, amplitude: 3, frequency: 0.2 },
      { id: 'Param16', base: -10, amplitude: 2, frequency: 0.2 },
    ],
  },

  // 惊讶：后仰 + 尾巴竖起
  denied: {
    speed: 0.15,
    interval: 40,
    params: [
      { id: 'ParamAngleX', base: -15, amplitude: 8, frequency: 1.2 },
      { id: 'ParamAngleZ', base: 0, amplitude: 10, frequency: 0.8 },
      { id: 'ParamBodyAngleX', base: -8, amplitude: 4, frequency: 1 },
      { id: 'Param14', base: 25, amplitude: 10, frequency: 1.5 },
      { id: 'Param15', base: 20, amplitude: 8, frequency: 1.5 },
      { id: 'Param16', base: 15, amplitude: 6, frequency: 1.5 },
    ],
  },

  // 忙碌：轻微晃动 + 尾巴快速小幅摆动
  busy: {
    speed: 0.18,
    interval: 40,
    params: [
      { id: 'ParamAngleZ', base: 0, amplitude: 5, frequency: 1.2 },
      { id: 'ParamBodyAngleY', base: 0, amplitude: 3, frequency: 1.5 },
      { id: 'Param14', base: 0, amplitude: 15, frequency: 3 },
      { id: 'Param15', base: 0, amplitude: 12, frequency: 3 },
      { id: 'Param16', base: 0, amplitude: 10, frequency: 3 },
      { id: 'Param17', base: 0, amplitude: 8, frequency: 3 },
    ],
  },

  // 搜索：左右看 + 尾巴慢摆
  searching: {
    speed: 0.08,
    interval: 50,
    params: [
      { id: 'ParamAngleY', base: 0, amplitude: 15, frequency: 0.6 },
      { id: 'ParamAngleZ', base: 5, amplitude: 8, frequency: 0.4 },
      { id: 'Param14', base: 0, amplitude: 12, frequency: 0.4 },
      { id: 'Param15', base: 0, amplitude: 10, frequency: 0.4 },
    ],
  },
}
