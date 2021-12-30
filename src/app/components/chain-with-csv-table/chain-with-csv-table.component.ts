import { Component, OnInit } from '@angular/core';
import { ChainService } from 'src/app/services/chain.service';

export type DisplayEnumType = 'show | hide | bottomLine';

@Component({
  selector: 'app-chain-with-csv-table',
  templateUrl: './chain-with-csv-table.component.html',
  styleUrls: ['./chain-with-csv-table.component.scss']
})
export class ChainWithCSVTableComponent implements OnInit {

  public propertyNumberType = 'SurveyNumber';
  public ecStartDate = '1987'
  public showChainDefaultHeader = true;
  public constants = {};
  public extractDataModel: Array<any> = [];
  public chainModel: Array<any> = [];
  public set = 1;
  public header = 'Set,Child,Parent,DisplayName';

  constructor(private chainService: ChainService) {
  }

  ngOnInit(): void {
    const sheetName = 'chain-data-table.csv';
    this.chainService.getCSVData(sheetName).subscribe(data => {
      const items = data ? data.replace(this.header, '').split('\r\n').filter(it => it) : [];
      if (items && items.length > 0) {
        const extractDataModel = items.map((it: any, index: number) => {
          const [set, child, parent, displayName] = it ? it.split(',') : [];
          return {
            index: index + 1,
            rowIndex: 0,
            set: set, // temporary
            child: child,
            parent: parent,
            displayName: displayName,
            displayEnum: 'show',
            sameChildren: [],
            childrenCount: 0,
            virtualChild: false,
            needToPositioning: false,
            parentLists: []
          };
        }).filter(it => parseInt(it.set) === this.set);
        this.extractDataModel = this.constructDataModel(extractDataModel);
        this.chainModel = this.constructParentAndChild(this.extractDataModel);
        console.log(this.chainModel);
      }
    });
  }

  constructDataModel(items: Array<any>) {
    if (!items || items.length === 0) {
      return [];
    }
    const result: any = {};
    for (const item of items) {
      const child = item.child;
      const parent = item.parent;
      result[child] = result[child] ? result[child] : [];
      if (result[child].length > 0) {
        const parentLists = result[child];
        const lastParent = parentLists[parentLists.length - 1];
        const findParent = items.find(it => it.parent === lastParent && it.child === child);
        findParent.displayEnum = 'hide';
      }
      item.parentLists = result[child];
      result[child].push(parent);
    }
    return items;
  }

  constructParentAndChild(items: Array<any>) {
    try {

      // https://stackoverflow.com/questions/18017869/build-tree-array-from-flat-array-in-javascript
      if (!items || items.length === 0) {
        return [];
      }
      const mapItems = items.reduce((result: any, current: any, index) => {
        current = Object.assign({}, current);
        current.children = [];
        const parent = current.parent;
        const child = current.child;
        result[parent] = result[parent] ? result[parent] : {};
        const currentParent = result[parent];
        currentParent.children = currentParent.children ? currentParent.children : [];
        currentParent.children.push(current);
        current.rowIndex = currentParent.rowIndex > 0 ? currentParent.rowIndex + 1 : 1;
        if (parent !== 'None') {
          currentParent.childrenCount = currentParent.childrenCount + 1;
        }
        if (result[child] && Object.keys(result[child]).length > 0) {
          result = this.constructVirtualChild(result, current);
          current.needToPositioning = true;
          result[child] = current;
        } else {
          result[child] = current;
        }
        return result;
      }, {});

      return mapItems['None'].children;
    } catch (ex) {
      throw ex;
    }

  }

  constructVirtualChild(existing: any, current: any) {
    try {
      const rowDifference: number = this.calculateRowDistance(existing, current);
      existing = this.createVirtualChildByRow(rowDifference, existing, current);
      return existing;
    } catch (ex) {
      throw ex;
    }
  }

  calculateRowDistance(existing: any, current: any) {
    try {
      const parent = current.parent;
      const child = current.child;
      const previousParent = this.getPreviousParent(child, existing);
      const currentParentIndex = this.getCurrentParentRowIndex(child, existing[parent]);
      const previousParentIndex = this.getPreviousParentRowIndex(previousParent);
      return currentParentIndex - previousParentIndex;
    } catch (ex) {
      throw ex;
    }
  }

  createVirtualChildByRow(rowDifference: number, existing: any, current: any) {
    try {
      const parent = current.parent;
      const child = current.child;
      if (rowDifference > 0) {
        existing = this.createVirtualChildForPreviousChildren(existing, current);
      } else if (rowDifference <= -1 && existing[parent]) {
        for (let i = 0; i < -(rowDifference); i++) {
          const childrenLists = this.virtualChildModel(child, existing[parent].children);
          existing[parent].children = childrenLists;
        }
      }
      return existing;
    } catch (ex) {
      throw ex;
    }
  }

  createVirtualChildForPreviousChildren(existing: any, current: any) {
    try {
      const parent = current.parent;
      const child = current.child;
      for (const pParent of current.parentLists) {
        if (parent === pParent) {
          return existing;
        }
        const findIndex = existing[pParent].children.findIndex((it: any) => it.child === child);
        if (findIndex >= -1) {
          const currentParentIndex = this.getCurrentParentRowIndex(child, existing[parent]);
          const previousParentIndex = this.getPreviousParentRowIndex(existing[pParent]);
          const rowDifference = currentParentIndex - previousParentIndex;
          if (rowDifference > 0) {
            for (let i = 0; i < rowDifference; i++) {
              const childrenLists = this.virtualChildModel(child, existing[pParent].children);
              existing[pParent].children = childrenLists;
            }
          }
        }
      }
      return existing;
    } catch (ex) {
      throw ex;
    }
  }

  virtualChildModel(currentChild: any, children: Array<any>) {
    try {
      const findIndex = children.findIndex((it: any) => it.child === currentChild);
      if (findIndex > -1) {
        const findChild = children[findIndex];
        const uniqueId = Math.random().toString(16).slice(8);
        const existingChildren = this.updateRowIndex(findChild);
        const newVirtualChild = {
          rowIndex: existingChildren.rowIndex - 1,
          set: 1,
          child: currentChild,
          parent: findChild.parent,
          children: [existingChildren],
          displayName: `${uniqueId}`,
          sameChildren: [],
          childrenCount: 0,
          virtualChild: true,
          needToPositioning: false,
          displayEnum: 'bottomLine'
        };
        children[findIndex] = Object.assign({}, newVirtualChild);
      }
      return children

    } catch (ex) {
      throw ex;
    }
  }

  updateRowIndex(child: any): any {
    try {
      const renderChild = Object.assign({}, child);
      renderChild.rowIndex = this.incrementRowIndex(renderChild.rowIndex);
      if (!renderChild.children || renderChild.children.length === 0) {
        return renderChild;
      }
      const children = renderChild.children.map((it: any) => {
        return Object.assign({}, it);
      });
      for (const child of children) {
        child.rowIndex = this.incrementRowIndex(renderChild.rowIndex);
        this.updateRowIndex(child.children);
      }
      return renderChild;
    } catch (ex) {
      throw ex;
    }
  }

  getPreviousParentRowIndex(previousParent: any) {
    try {
      const virtualChildren = previousParent.children.filter((it: any) => it.virtualChild);
      if (!virtualChildren || virtualChildren.length === 0) {
        return previousParent.rowIndex;
      } else {
        let rowIndex = 0;
        for (const vChild of virtualChildren) {
          rowIndex = this.getPreviousParentRowIndex(vChild);
        }
        return rowIndex;
      }
    } catch (ex) {
      throw ex;
    }
  }

  getCurrentParentRowIndex(child: any, currentParent: any) {
    try {
      const items = currentParent.children.filter((it: any) => !it.virtualChild && it.child === child);
      if (items && items.length > 0) {
        return currentParent.rowIndex;
      } else {
        let rowIndex = 0;
        for (const item of currentParent.children) {
          rowIndex = this.getCurrentParentRowIndex(child, item);
        }
        return rowIndex;
      }
    } catch (ex) {
      throw ex;
    }
  }

  getPreviousParent(child: any, existing: any) {
    const pParent = existing[child].parent;
    return existing[pParent];
  }

  incrementRowIndex(rowIndex: number) {
    return rowIndex > 0 ? rowIndex + 1 : 1
  }
}


// Need to find each node of the height
// If two node height is difference the find the how much difference of the node height and add 24px addition with that

