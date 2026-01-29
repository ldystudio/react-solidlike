import { describe, expect, test } from "bun:test";
import { renderToString } from "react-dom/server";
import { Repeat } from "./Repeat";

describe("Repeat 组件", () => {
    describe("基本功能", () => {
        test("重复渲染指定次数", () => {
            const html = renderToString(<Repeat times={3}>{(i) => <span key={i}>Item</span>}</Repeat>);
            const matches = html.match(/<span>Item<\/span>/g);
            expect(matches?.length).toBe(3);
        });

        test("传递正确的索引给 children", () => {
            const html = renderToString(<Repeat times={3}>{(i) => <span key={i}>{i}</span>}</Repeat>);
            expect(html).toContain("0");
            expect(html).toContain("1");
            expect(html).toContain("2");
        });

        test("索引从 0 开始", () => {
            const indices: number[] = [];
            renderToString(
                <Repeat times={3}>
                    {(i) => {
                        indices.push(i);
                        return <span key={i}>{i}</span>;
                    }}
                </Repeat>
            );
            expect(indices).toEqual([0, 1, 2]);
        });
    });

    describe("边界情况", () => {
        test("times 为 0 时不渲染任何内容", () => {
            const html = renderToString(<Repeat times={0}>{(i) => <span key={i}>Item</span>}</Repeat>);
            expect(html).toBe("");
        });

        test("times 为负数时不渲染任何内容", () => {
            const html = renderToString(<Repeat times={-5}>{(i) => <span key={i}>Item</span>}</Repeat>);
            expect(html).toBe("");
        });

        test("times 为 1 时渲染一次", () => {
            const html = renderToString(<Repeat times={1}>{(i) => <span key={i}>Single</span>}</Repeat>);
            expect(html).toContain("Single");
            const matches = html.match(/<span>Single<\/span>/g);
            expect(matches?.length).toBe(1);
        });
    });

    describe("复杂渲染", () => {
        test("支持渲染复杂组件", () => {
            const html = renderToString(
                <Repeat times={2}>
                    {(i) => (
                        <div key={i} className="item">
                            <h3>Title {i}</h3>
                            <p>Content {i}</p>
                        </div>
                    )}
                </Repeat>
            );
            expect(html).toContain("Title");
            expect(html).toContain("Content");
            expect(html).toContain("0");
            expect(html).toContain("1");
        });

        test("支持条件渲染", () => {
            const html = renderToString(
                <Repeat times={4}>{(i) => (i % 2 === 0 ? <span key={i}>Even {i}</span> : null)}</Repeat>
            );
            expect(html).toContain("Even");
            expect(html).toContain("0");
            expect(html).toContain("2");
            // 奇数不应出现
            const matches = html.match(/Even/g);
            expect(matches?.length).toBe(2);
        });
    });

    describe("嵌套使用", () => {
        test("支持嵌套 Repeat", () => {
            const html = renderToString(
                <Repeat times={2}>
                    {(i) => (
                        <div key={i}>
                            Row {i}:<Repeat times={3}>{(j) => <span key={j}>Col {j}</span>}</Repeat>
                        </div>
                    )}
                </Repeat>
            );
            expect(html).toContain("Row");
            expect(html).toContain("Col");
            // 应该有 2 行，每行 3 列
            const rows = html.match(/Row/g);
            const cols = html.match(/Col/g);
            expect(rows?.length).toBe(2);
            expect(cols?.length).toBe(6); // 2 * 3
        });
    });

    describe("实际用例", () => {
        test("渲染星级评分", () => {
            const rating = 4;
            const html = renderToString(
                <div>
                    <Repeat times={rating}>{(i) => <span key={i}>★</span>}</Repeat>
                    <Repeat times={5 - rating}>{(i) => <span key={i}>☆</span>}</Repeat>
                </div>
            );
            const filled = html.match(/★/g);
            const empty = html.match(/☆/g);
            expect(filled?.length).toBe(4);
            expect(empty?.length).toBe(1);
        });

        test("生成占位骨架屏", () => {
            const html = renderToString(
                <Repeat times={3}>
                    {(i) => (
                        <div key={i} className="skeleton">
                            Loading...
                        </div>
                    )}
                </Repeat>
            );
            const skeletons = html.match(/class="skeleton"/g);
            expect(skeletons?.length).toBe(3);
        });
    });

    describe("wrapper 功能", () => {
        test("使用 wrapper 包装所有元素", () => {
            const html = renderToString(
                <Repeat times={3} wrapper={<div className="stars" />}>
                    {(i) => <span key={i}>★</span>}
                </Repeat>
            );
            expect(html).toContain('<div class="stars">');
            expect(html).toContain("</div>");
            const stars = html.match(/★/g);
            expect(stars?.length).toBe(3);
        });

        test("wrapper 可以是带属性的元素", () => {
            const html = renderToString(
                <Repeat times={2} wrapper={<ul id="list" data-testid="repeat-wrapper" />}>
                    {(i) => <li key={i}>Item {i}</li>}
                </Repeat>
            );
            expect(html).toContain('id="list"');
            expect(html).toContain('data-testid="repeat-wrapper"');
            expect(html).toContain("<li>");
        });

        test("未提供 wrapper 时直接返回元素数组", () => {
            const html = renderToString(<Repeat times={2}>{(i) => <span key={i}>{i}</span>}</Repeat>);
            // 没有额外的包装元素
            expect(html).toBe("<span>0</span><span>1</span>");
        });

        test("times 为 0 时 wrapper 不渲染", () => {
            const html = renderToString(
                <Repeat times={0} wrapper={<div className="empty" />}>
                    {(i) => <span key={i}>{i}</span>}
                </Repeat>
            );
            expect(html).toBe("");
            expect(html).not.toContain("empty");
        });

        test("times 为负数时 wrapper 不渲染", () => {
            const html = renderToString(
                <Repeat times={-3} wrapper={<div className="negative" />}>
                    {(i) => <span key={i}>{i}</span>}
                </Repeat>
            );
            expect(html).toBe("");
        });

        test("wrapper 用于星级评分容器", () => {
            const rating = 3;
            const html = renderToString(
                <Repeat times={5} wrapper={<div className="rating" />}>
                    {(i) => <span key={i}>{i < rating ? "★" : "☆"}</span>}
                </Repeat>
            );
            expect(html).toContain('class="rating"');
            const filled = html.match(/★/g);
            const empty = html.match(/☆/g);
            expect(filled?.length).toBe(3);
            expect(empty?.length).toBe(2);
        });

        test("嵌套 Repeat 各自独立的 wrapper", () => {
            const html = renderToString(
                <Repeat times={2} wrapper={<div className="outer" />}>
                    {(i) => (
                        <div key={i}>
                            Row {i}:
                            <Repeat times={3} wrapper={<span className="inner" />}>
                                {(j) => <em key={j}>{j}</em>}
                            </Repeat>
                        </div>
                    )}
                </Repeat>
            );
            expect(html).toContain('class="outer"');
            expect(html).toContain('class="inner"');
        });
    });
});
