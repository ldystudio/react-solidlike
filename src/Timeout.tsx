import { type ReactNode, useEffect, useState } from "react";

/** Timeout mode | 超时模式 */
export type TimeoutMode = "after" | "before";

export interface TimeoutProps {
    /** Delay time in milliseconds | 延迟时间（毫秒） */
    ms: number;
    /** Content to render | 要渲染的内容 */
    children: ReactNode;
    /** Display mode: 'after' = show after delay, 'before' = hide after delay | 显示模式：'after' = 延迟后显示，'before' = 延迟后隐藏 */
    mode?: TimeoutMode;
    /** Content to show when hidden (only for 'after' mode) | 隐藏时显示的内容（仅 'after' 模式） */
    fallback?: ReactNode | (() => ReactNode);
    /** Callback when timeout occurs | 超时发生时的回调 */
    onTimeout?: () => void;
}

/**
 * Timeout component, shows or hides content after a specified delay
 *
 * 超时组件，在指定延迟后显示或隐藏内容
 *
 * @example
 * // Show content after delay (fade-in effect) | 延迟后显示内容（淡入效果）
 * <Timeout ms={1000} mode="after">
 *   <DelayedMessage />
 * </Timeout>
 *
 * @example
 * // Hide content after delay (auto-dismiss) | 延迟后隐藏内容（自动消失）
 * <Timeout ms={3000} mode="before">
 *   <Toast message="Saved successfully!" />
 * </Timeout>
 *
 * @example
 * // With fallback while waiting | 等待时显示 fallback
 * <Timeout ms={2000} mode="after" fallback={<Spinner />}>
 *   <SlowComponent />
 * </Timeout>
 *
 * @example
 * // With onTimeout callback | 带超时回调
 * <Timeout ms={5000} mode="before" onTimeout={() => console.log("Dismissed")}>
 *   <Notification />
 * </Timeout>
 */
export function Timeout({ ms, children, mode = "after", fallback = null, onTimeout }: TimeoutProps): ReactNode {
    const [ready, setReady] = useState(mode === "before");

    useEffect(() => {
        const timer = setTimeout(() => {
            setReady((prev) => !prev);
            onTimeout?.();
        }, ms);

        return () => clearTimeout(timer);
    }, [ms, onTimeout]);

    // 'after' mode: show when ready is true
    if (mode === "after") {
        return ready ? children : typeof fallback === "function" ? fallback() : fallback;
    }

    // 'before' mode: show when ready is true (starts true, becomes false after timeout)
    return ready ? children : null;
}
