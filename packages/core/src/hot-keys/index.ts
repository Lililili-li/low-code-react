/**
 * 只处理组件相关
 */

import { ComponentSchema } from "@/types"

type OperateId = 'delete' | 'cut' | 'copy' | 'paste' | 'moveUp' | 'moveDown' | 'moveLeft' | 'moveRight' | 'visible' | 'lock' | 'group' | 'undo' | 'redo'

interface MethodMapProps {
  id: OperateId // 删除 添加 剪切 复制 粘贴 移动微调
  action: (component: ComponentSchema, _?: any) => void // 参数一当前组件，参数二随意适配兼容分组需要传入最新的参数
}
export default class CmpHotKeysService {

  private methodMap: MethodMapProps[] = []


  private hotKeysMap = [
    {
      id: 'delete',
      key: 'delete, backspace',
      name: '删除'
    },
    {
      id: 'copy',
      key: 'ctrl+c, command+c',
      name: '复制'
    },
    {
      id: 'paste',
      key: 'ctrl+v, command+v',
      name: '粘贴'
    },
    {
      id: 'cut',
      key: 'ctrl+x, command+x',
      name: '剪切'
    },
    {
      id: 'visible',
      key: 'ctrl+p, command+p',
      name: '展示 / 隐藏元素'
    },
    {
      id: 'lockCanvas',
      key: 'ctrl+l, command+l',
      name: '锁定 / 解锁元素'
    },
    {
      id: 'group',
      key: 'ctrl+g, command+g',
      name: '创建分组 / 解除分组'
    },
    {
      id: 'undo',
      key: 'ctrl+z, command+z',
      name: '撤销'
    },
    {
      id: 'redo',
      key: 'ctrl+y, command+y',
      name: '恢复'
    },
    {
      id: 'moveUp',
      key: 'ArrowUp',  // ✅ 只使用 up，去掉 arrowup
      name: '向上移动'
    },
    {
      id: 'moveDown',
      key: 'ArrowDown',  // ✅ 只使用 down
      name: '向下移动'
    },
    {
      id: 'moveLeft',
      key: 'ArrowLeft',  // ✅ 只使用 left
      name: '向左移动'
    },
    {
      id: 'moveRight',
      key: 'ArrowRight',  // ✅ 只使用 right
      name: '向右移动'
    },
  ]

  getHotKeysMap() {
    return this.hotKeysMap
  }

  registerMethod(id: OperateId, action: (component: ComponentSchema, _?: any) => void) {
    this.methodMap.push({
      id,
      action
    })
  }

  clearMethod(id?: string) {
    if (id) {
      this.methodMap = this.methodMap.filter(item => item.id !== id)
      return
    }
    this.methodMap = []
  }

  getMethod(id: OperateId) {
    return this.methodMap.find(item => item.id === id)
  }

}