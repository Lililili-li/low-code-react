import { AnimationConfig } from "@/types";

export const handleAnimationStyle = (animation?: AnimationConfig) => {
  if (!animation?.enable || !animation.name) return {};

  return {
    ...(animation.duration && { animationDuration: `${animation.duration}s` }),
    ...(animation.speed && { animationTimingFunction: animation.speed }),
    ...(animation.delay && { animationDelay: `${animation.delay}s` }),
    ...(animation.iterationCount !== undefined && {
      animationIterationCount:
        animation.iterationCount === -1 ? 'infinite' : animation.iterationCount,
    }),
  };
};

export const handleAnimationClass = (animation: AnimationConfig) => {
  if (!animation?.enable || !animation.name) return ''
  return animation?.enable && animation.name
    ? `animate__animated animate__${animation.name}`
    : '';
}
