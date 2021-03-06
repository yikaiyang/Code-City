import { AbstractGraphCommit } from './elements/abstract-graph-commit';
import { Commit } from 'src/app/model/commit.model';
import { Dimension, computeDimensions } from './compute-position';

export class GitGraphGrid {
  // Stores which branches are active at index i of array. Used when drawing lines between commits.
  private activeBranches: string[][] = [];

  private branchesCount = 0;

  private getCommitsCount(): number {
      return this.activeBranches.length;
  }

  getActiveBranches(x: number): string[] {
    return Object.assign([], this.activeBranches[x]);
  }

  setActiveBranches(x: number, occupiedBranches: string[]): void {
    this.activeBranches[x] = occupiedBranches;

    // Update number of max branches in the grid.
    if (occupiedBranches.length > this.branchesCount) {
        this.branchesCount = occupiedBranches.length;
    }
  }

  getDimensions(): Dimension {
    const dimensions = computeDimensions(this.getCommitsCount(), this.branchesCount);
    return {
        height: dimensions.height,
        width: dimensions.width
    };
  }

  /**
   * Checks whether branch is set in the occupiedBranches array.
   */
  isOccupied(x: number, y: number): boolean {
    const occupiedBranches = this.getActiveBranches(x);
    const element = occupiedBranches[y];
    return element !== null ? true : false;
  }

  isValidBranchPath(
    startElement: AbstractGraphCommit,
    endX: number,
    endY: number
  ): boolean {
    if (startElement == null || endX < 0 || endY < 0) {
      console.warn(`isValidBranchPath: Received invalid values as parameters.`);
      return false;
    }
    // Use x coordinate of start element as starting point
    const startX = startElement.graphPositionX;
    // Traverse through all elements up until endElement is reached. If the graph contains other elements the path is not valid.
    for (let x = startX; x < endX; x++) {
      if (this.isOccupied(x, endY)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Computes eligible replacements/successors to commits stored in the active branches array.
   */
  getReplacementInActiveBranches(commit: Commit, activeBranches: string[]): number[] {
    // For all parent ids of the commit, check if a parent is in the active branches array.
    const replacements = [];
    commit.parentCommitIDs.forEach((parentId) => {
      const replacement = activeBranches.findIndex((c) => c === parentId);
      if (replacement !== -1) {
        replacements.push(replacement);
      }
    });
    return replacements;
  }

  /**
   * Retrieves the next empty slot available in the active branches array.
   * @param commit
   * @param activeBranches
   */
  getEmptySlotInActiveBranches(
    commit: Commit,
    activeBranches: string[]
  ): number {
    const emptySlotIndex = activeBranches.findIndex(val => val === null);
    return emptySlotIndex;
  }

  /**
   * Retrieves an array with indices of all empty slots available in the active branches array.
   * @param commit
   * @param activeBranches
   */
  getEmptySlotsInActiveBranches(
    activeBranches: string[]
  ): number[] {
    const emptySlots = [];
    for (let i = 0; i < activeBranches.length; i++) {
      if (activeBranches[i] == null) {
        emptySlots.push(i);
      }
    }
    return emptySlots;
  }
}
