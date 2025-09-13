/**
 * 车辆类型判断工具函数
 * 支持扩展更多车型
 */

// 车辆类型枚举
export type VehicleType = 'social' | 'black' | 'unknown';

// 车辆类型配置
export const VEHICLE_TYPE_CONFIG = {
  SOCIAL_CAR_MAX_USERS: [10, 100] as const,
  BLACK_CAR_MAX_USERS: [] as const, // 黑车暂时没有特定的maxUsers值
} as const;

/**
 * 根据maxUsers判断车辆类型
 * @param maxUsers 车辆最大用户数
 * @returns 车辆类型
 */
export function getVehicleType(maxUsers: number): VehicleType {
  if (VEHICLE_TYPE_CONFIG.SOCIAL_CAR_MAX_USERS.includes(maxUsers as 10 | 100)) {
    return 'social';
  }
  
  // 其他情况暂时归类为黑车
  // 未来可以根据更多条件进行判断
  return 'black';
}

/**
 * 检查是否为社车
 * @param maxUsers 车辆最大用户数
 * @returns 是否为社车
 */
export function isSocialCar(maxUsers: number): boolean {
  return getVehicleType(maxUsers) === 'social';
}

/**
 * 检查是否为黑车
 * @param maxUsers 车辆最大用户数
 * @returns 是否为黑车
 */
export function isBlackCar(maxUsers: number): boolean {
  return getVehicleType(maxUsers) === 'black';
}

/**
 * 获取车辆类型的显示名称
 * @param vehicleType 车辆类型
 * @returns 显示名称
 */
export function getVehicleTypeDisplayName(vehicleType: VehicleType): string {
  switch (vehicleType) {
    case 'social':
      return '社车';
    case 'black':
      return '黑车';
    case 'unknown':
      return '未知';
    default:
      return '未知';
  }
}
