/**
 * 只处理组件相关
 */

export default class CmpHotKeysService {

  private hotKeysMap = [
    {
      key: 'delete, backspace',
      action: (id?: string) => {
        console.log('删除', id);
      }
    },
    {
      key: 'ctrl+c, command+c',
      action: (e?: KeyboardEvent) => {
        e?.preventDefault();
        console.log('复制');
      }
    },
  ]

  getHotKeysMap() {
    return this.hotKeysMap
  }
}