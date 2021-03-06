import { RenderElement } from "../render-element";
import { Svg, Shape } from "@svgdotjs/svg.js";
import { GraphCommit } from "./graph-commit";
import { GraphMergeCommit } from "./graph-merge-commit";
import { AbstractGraphCommit, GraphCommitState } from "./abstract-graph-commit";
import { getBranchColor } from "../graph-colors";
import { brightenColor } from 'src/app/util/color-scheme';

export const STROKE_WIDTH = 3;

// Offsets due to bounding boxes of commit circles
export const OFFSET_X = 15 / 2;
export const OFFSET_Y = 20 / 2;

export function generateGraphLineKey(commitId: string, parentCommitId: string): string {
  return `${commitId}_${parentCommitId}`;
}

export class GraphLine implements RenderElement {
  x: number;
  y: number;
  constructor(
    private startElement: AbstractGraphCommit,
    private endElement: AbstractGraphCommit
  ) {}

  state: GraphCommitState = GraphCommitState.Default;
  shape: Shape;
  private color: string;

  render(svg: Svg): void {
    if (this.startElement == null || this.endElement == null) {
      console.error(
        `GraphRoundedLine: Could not render due to invalid values: ` +
          `startElement: ${this.startElement} endElement: ${this.endElement}`
      );
    }
    if (this.endElement instanceof GraphCommit) {
      this.renderBranchOut(svg);
    } else if (this.endElement instanceof GraphMergeCommit) {
      this.renderBranchIn(svg);
    }
  }

  setState(state: GraphCommitState) {
    if (state === GraphCommitState.Default) {
        this.shape.stroke({
            width: STROKE_WIDTH,
            color: this.color,
        });
      this.state = state;
    } else if (state === GraphCommitState.Selected) {
        this.shape.stroke({
            width: STROKE_WIDTH + 3,
            color: brightenColor(this.color, 0.5),
          });
        this.state = state;
    } else if (state === GraphCommitState.Highlight) {
      // Do not persist state for highlight state. (Hover state).
      this.shape.stroke({
        width: STROKE_WIDTH + 3,
        color: brightenColor(this.color, 0.5),
      });
    }
  }

  private renderBranchIn(svg: Svg): void {
    this.color = getBranchColor(this.startElement.graphPositionY);
    const startX = this.startElement.x + OFFSET_X;
    const startY = this.startElement.y + OFFSET_Y;
    const endX = this.endElement.x + OFFSET_X;
    const endY = this.endElement.y + OFFSET_Y;

    if (endY > startY) {
      /**
       * Example for svg path representing inverted L shaped arc.
       *  P1----P2--      P1 -- Starting point connecting to line of branch, which should be merged in (Line connecting to P2)
       *            |     P2 -- Starting point of curved arc.
       *            |
       *           P3     P3 -- End point of curved arc.
       *            |
       *            |
       *           P4     P4 -- Point connecting to branch in which . (Line from P3 to P4)
       *
       */
      //  'M 165 20 L 165 40'
      //  'M 155 50 Q 165 50 165 40' +
      //  'M 120 50 L 155 50' +
      const CIRCLE_WIDTH = 18;
      const P1_X = startX + CIRCLE_WIDTH / 2;
      const P1_Y = startY;
      const P2_X = endX - 10;
      const P3_X = endX;
      const P3_Y = startY + 10;
      const P4_Y = endY;
      this.shape = svg
        .id(`${this.endElement.commit.commitId}_${this.startElement.commit.commitId}`)
        .path(
          `M ${P1_X} ${P1_Y} L ${P2_X} ${P1_Y}` +
            `M ${P2_X} ${P1_Y} Q ${P3_X} ${P1_Y} ${P3_X} ${P3_Y}` +
            `M ${P3_X} ${P3_Y} L ${P3_X} ${P4_Y}`
        )
        .stroke({
          width: STROKE_WIDTH,
          color: this.color,
        })
        .on("mouseover", () => {
          this.handleOnMouseOver();
        })
        .on("mouseout", () => {
          this.handleOnMouseOut();
        })
        .fill("transparent")
        .back();
    } else if (endY === startY) {
      this.shape = svg
        .id(`${this.endElement.commit.commitId}_${this.startElement.commit.commitId}`)
        .line(
          this.startElement.x + OFFSET_X,
          this.startElement.y + OFFSET_Y,
          this.endElement.x + OFFSET_X,
          this.endElement.y + OFFSET_Y
        )
        .stroke({
          width: STROKE_WIDTH,
          color: getBranchColor(this.startElement.graphPositionY),
          linecap: "round",
        })
        .on("mouseover", () => {
          this.handleOnMouseOver();
        })
        .on("mouseout", () => {
          this.handleOnMouseOut();
        })
        .back();
    } else {
      /**
       * Example for svg path representing inverted L shaped arc.
       *            P4    P1 -- Starting point connecting to line of branch, which should be merged in (Line connecting to P2)
       *            |     P2 -- Starting point of curved arc.
       *            |
       *           P3     P3 -- End point of curved arc.
       *            |     P4 -- Point connecting to branch in which . (Line from P3 to P4)
       *            |
       * P1----P2---
       */
      //  'M 120 50 L 155 50'
      //  'M 155 50 Q 165 50 165 40' +
      //  'M 165 20 L 165 40' +
      const CIRCLE_WIDTH = 18;
      const P1_X = startX + CIRCLE_WIDTH / 2;
      const P1_Y = startY;
      const P2_X = endX - 10;
      const P3_X = endX;
      const P3_Y = startY - 10;
      const P4_Y = endY;
      this.shape = svg
        .id(`${this.endElement.commit.commitId}_${this.startElement.commit.commitId}`)
        .path(
          `M ${P1_X} ${P1_Y} L ${P2_X} ${P1_Y}` +
            `M ${P2_X} ${P1_Y} Q ${P3_X} ${P1_Y} ${P3_X} ${P3_Y}` +
            `M ${P3_X} ${P3_Y} L ${P3_X} ${P4_Y}`
        )
        .stroke({
          width: STROKE_WIDTH,
          color: this.color,
        })
        .on("mouseover", () => {
          this.handleOnMouseOver();
        })
        .on("mouseout", () => {
          this.handleOnMouseOut();
        })
        .fill("transparent")
        .back();
    }
  }

  private renderBranchOut(svg: Svg): void {
    this.color = getBranchColor(this.endElement.graphPositionY);
    const startX = this.startElement.x + OFFSET_X;
    const startY = this.startElement.y + OFFSET_Y;
    const endX = this.endElement.x + OFFSET_X;
    const endY = this.endElement.y + OFFSET_Y;

    // Check if end node is above or below start node in y-coordinate.
    if (startY < endY) {
      /**
       * Render L shaped arc
       * Example for svg path representing L shaped arc.
       * P1               P1 -- Point of branch out (Line connecting to P2)
       * |
       * |
       * P2               P2 -- Point of curved arc begin.
       * |
       * |                P3 -- Point of curved arc end
       * L--P3------P4    P4 -- Point connecting to new branch line. (Line from P3 to P4)
       */
      // 'M 125 20 L 125 40' + // Vertical line towards arc (P1 = 125, 20) (P2 = 125, 40)
      // 'M 125 40 Q 125 50 135 50' + // L-shaped Arc from top to right (P2 = 125,40) (Q = 125,50 Quadratic bezier) (P3 = 135 50)
      // 'M 135 50 L 160 50' // Horizontal line from arc towards next commit circle (P3 = 135 50) (P4 = 160 50)

      const P1_X = startX;
      const P1_Y = startY;
      const P2_Y = endY - 10;
      const P3_X = P1_X + 10;
      const P3_Y = endY;
      const P4_X = endX;
      this.shape = svg
        .id(`${this.endElement.commit.commitId}_${this.startElement.commit.commitId}`)
        .path(
          `M ${P1_X} ${P1_Y} L ${P1_X} ${P2_Y}` +
            `M ${P1_X} ${P2_Y} Q ${P1_X} ${endY} ${P3_X} ${P3_Y}` +
            `M ${P3_X} ${P3_Y} L ${P4_X} ${P3_Y}`
        )
        .stroke({
          width: STROKE_WIDTH,
          color: this.color,
        })
        .on("mouseover", () => {
          this.handleOnMouseOver();
        })
        .on("mouseout", () => {
          this.handleOnMouseOut();
        })
        .fill("transparent")
        .back();
    } else if (endY === startY) {
      this.shape = svg
        .id(`${this.endElement.commit.commitId}_${this.startElement.commit.commitId}`)
        .line(
          this.startElement.x + OFFSET_X,
          this.startElement.y + OFFSET_Y,
          this.endElement.x + OFFSET_X,
          this.endElement.y + OFFSET_Y
        )
        .stroke({
          width: STROKE_WIDTH,
          color: this.color,
          linecap: "round",
        })
        .on("mouseover", () => {
          this.handleOnMouseOver();
        })
        .on("mouseout", () => {
          this.handleOnMouseOut();
        })
        .back();
    } else {
      /**
       * Render L shaped arc
       * Example for svg path representing L shaped arc.
       * |--P3------P4    P4 -- Point connecting to new branch line. (Line from P3 to P4)
       * |                P3 -- Point of curved arc end
       * | P2             P2 -- Point of curved arc begin.
       * |
       * |
       * |
       * | P1            P1 -- Point of branch out (Line connecting to P2)
       */
      // 'M 125 20 L 125 40' + // Vertical line towards arc (P1 = 125, 20) (P2 = 125, 40)
      // 'M 125 40 Q 125 50 135 50' + // L-shaped Arc from top to right (P2 = 125,40) (Q = 125,50 Quadratic bezier) (P3 = 135 50)
      // 'M 135 50 L 160 50' // Horizontal line from arc towards next commit circle (P3 = 135 50) (P4 = 160 50)

      const P1_X = startX;
      const P1_Y = startY;
      const P2_Y = endY + 10;
      const P3_X = P1_X + 10;
      const P3_Y = endY;
      const P4_X = endX;
      this.shape = svg
        .id(`${this.endElement.commit.commitId}_${this.startElement.commit.commitId}`)
        .path(
          `M ${P1_X} ${P1_Y} L ${P1_X} ${P2_Y}` +
            `M ${P1_X} ${P2_Y} Q ${P1_X} ${endY} ${P3_X} ${P3_Y}` +
            `M ${P3_X} ${P3_Y} L ${P4_X} ${P3_Y}`
        )
        .stroke({
          width: STROKE_WIDTH,
          color: this.color,
        })
        .on("mouseover", () => {
          this.handleOnMouseOver();
        })
        .on("mouseout", () => {
          this.handleOnMouseOut();
        })
        .fill("transparent")
        .back();
    }
  }

  private handleOnMouseOver() {
    if (this.state === GraphCommitState.Default) {
      this.shape.stroke({
        width: STROKE_WIDTH + 1,
        color: this.color,
      });
    }
  }

  private handleOnMouseOut() {
    if (this.state === GraphCommitState.Default) {
      this.shape.stroke({
        width: STROKE_WIDTH,
        color: this.color,
      });
    }
  }
}
