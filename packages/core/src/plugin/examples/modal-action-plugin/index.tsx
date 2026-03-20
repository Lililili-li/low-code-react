import React, { useState } from 'react';
import { ActionPlugin, ActionDefinition, ActionContext } from '../../types';

// ==================== 配置面板 ====================

interface ModalConfig {
  modalId: string;
  animation?: 'fade' | 'slide' | 'zoom' | 'none';
  maskClosable?: boolean;
  width?: number;
  title?: string;
}

const OpenModalConfig: React.FC<{
  value: ModalConfig;
  onChange: (value: ModalConfig) => void;
}> = ({ value, onChange }) => {
  const [config, setConfig] = useState<ModalConfig>({
    animation: 'fade',
    maskClosable: true,
    width: 520,
    title: '',
    ...value,
  });

  const updateConfig = (key: keyof ModalConfig, val: any) => {
    const newConfig = { ...config, [key]: val };
    setConfig(newConfig);
    onChange(newConfig);
  };

  return (
    <div className="modal-config-panel space-y-4 p-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">弹窗 ID</label>
        <input
          type="text"
          value={config.modalId}
          onChange={(e) => updateConfig('modalId', e.target.value)}
          placeholder="请输入弹窗组件的 ID"
          className="w-full px-3 py-2 border rounded-md"
        />
        <p className="text-xs text-gray-500">需要先在页面中添加弹窗组件</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">弹窗标题</label>
        <input
          type="text"
          value={config.title}
          onChange={(e) => updateConfig('title', e.target.value)}
          placeholder="动态设置弹窗标题（可选）"
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">动画效果</label>
        <select
          value={config.animation}
          onChange={(e) => updateConfig('animation', e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="fade">淡入淡出</option>
          <option value="slide">滑动</option>
          <option value="zoom">缩放</option>
          <option value="none">无动画</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">弹窗宽度</label>
        <input
          type="number"
          value={config.width}
          onChange={(e) => updateConfig('width', parseInt(e.target.value))}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="maskClosable"
          checked={config.maskClosable}
          onChange={(e) => updateConfig('maskClosable', e.target.checked)}
          className="rounded"
        />
        <label htmlFor="maskClosable" className="text-sm">
          点击遮罩关闭
        </label>
      </div>
    </div>
  );
};

// ==================== 动作定义 ====================

const openModalAction: ActionDefinition = {
  id: 'openModal',
  name: '打开弹窗',
  icon: '🪟',
  description: '打开指定的弹窗组件',

  configPanel: OpenModalConfig,

  execute: async (context: ActionContext, config: ModalConfig) => {
    const { modalId, animation, maskClosable, width, title } = config;

    if (!modalId) {
      context.notify.error('未指定弹窗 ID');
      return;
    }

    console.log('[OpenModalAction] Opening modal:', {
      modalId,
      animation,
      maskClosable,
      width,
      title,
    });

    // 实际实现中应该调用应用的弹窗系统
    // 这里模拟打开弹窗
    context.notify.success(`弹窗 ${modalId} 已打开`);

    // 可以设置状态
    context.setState(`modal_${modalId}_visible`, true);
    if (title) {
      context.setState(`modal_${modalId}_title`, title);
    }
  },

  validate: (config: ModalConfig) => {
    if (!config.modalId) {
      return { valid: false, message: '请指定弹窗 ID' };
    }
    return { valid: true };
  },

  defaultConfig: {
    modalId: '',
    animation: 'fade',
    maskClosable: true,
    width: 520,
    title: '',
  },
};

// ==================== 关闭弹窗动作 ====================

const closeModalAction: ActionDefinition = {
  id: 'closeModal',
  name: '关闭弹窗',
  icon: '❌',
  description: '关闭指定的弹窗组件',

  configPanel: ({ value, onChange }) => {
    const [modalId, setModalId] = useState(value?.modalId || '');

    return (
      <div className="p-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">弹窗 ID</label>
          <input
            type="text"
            value={modalId}
            onChange={(e) => {
              setModalId(e.target.value);
              onChange({ modalId: e.target.value });
            }}
            placeholder="请输入要关闭的弹窗 ID"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>
    );
  },

  execute: async (context: ActionContext, config: { modalId: string }) => {
    const { modalId } = config;

    if (!modalId) {
      context.notify.error('未指定弹窗 ID');
      return;
    }

    console.log('[CloseModalAction] Closing modal:', modalId);
    context.setState(`modal_${modalId}_visible`, false);
    context.notify.success(`弹窗 ${modalId} 已关闭`);
  },

  validate: (config: { modalId: string }) => {
    if (!config.modalId) {
      return { valid: false, message: '请指定弹窗 ID' };
    }
    return { valid: true };
  },

  defaultConfig: {
    modalId: '',
  },
};

// ==================== 插件导出 ====================

const ModalActionPlugin: ActionPlugin = {
  meta: {
    id: 'modal-action-plugin',
    name: '弹窗动作插件',
    version: '1.0.0',
    author: 'Mini Team',
    description: '提供打开/关闭弹窗的事件动作',
    keywords: ['modal', 'dialog', 'popup'],
  },

  type: 'action',

  activate(context: import('../../types').PluginContext) {
    // 注册动作
    context.registerAction(openModalAction);
    context.registerAction(closeModalAction);

    console.log('[ModalActionPlugin] Activated successfully');
  },

  deactivate() {
    console.log('[ModalActionPlugin] Deactivated');
  },
};

export default ModalActionPlugin;
