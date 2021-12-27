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
        this.extractDataModel = items.map((it: any, index: number) => {
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
            connectorChildren: [],
            virtualChild: false,
            needToPositioning: false,
          };
        }).filter(it => parseInt(it.set) === this.set);
        this.chainModel = this.constructParentAndChild(this.extractDataModel);
        console.log(this.chainModel);
      }
    });
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
          const pParent = result[child].parent;
          const previousParent = result[pParent];
          current.needToPositioning = true;
          // const findIndex = previousParent.children.findIndex((pre: any) => pre.child === child);
          // if (findIndex > -1) {
          //   previousParent.children[findIndex].virtualChild = true;
          // }
          if (!previousParent.sameChildren.some((it: any) => it === child)) {
            previousParent.sameChildren.push(child);
          }
          if (!currentParent.sameChildren.some((it: any) => it === child)) {
            currentParent.sameChildren.push(child);
          }
          if (!previousParent.connectorChildren.some((it: any) => it === parent)) {
            previousParent.connectorChildren.push(parent);
          }
          if (!currentParent.connectorChildren.some((it: any) => it === pParent)) {
            currentParent.connectorChildren.push(pParent);
          }
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


  calculateColumnDistance(existing: any, current: any) {
    try {
      const child = current.child;
      const previousParent = existing[child];
      const previousParentIndex = previousParent ? previousParent.columnIndex : 0
      const difference = current.columnIndex - previousParentIndex;
      if (difference > 1 || difference <= 0) {
        debugger
      }
    } catch (ex) {
      throw ex;
    }
  }

  calculateRowDistance(existing: any, current: any) {
    try {
      const parent = current.parent;
      const child = current.child;
      const previousParent = this.getPreviousParent(child, existing);
      const currentParentIndex = existing[parent] && existing[parent].rowIndex ? existing[parent].rowIndex : 0;
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
      if (rowDifference === 0) {
        existing = this.hideCommonChildren(existing, current);
        return existing;
      } else if (rowDifference > 0) {
        const children = this.extractDataModel.filter(it => it.child === child);
        for (const item of children) {
          const pParent = item.parent;
          if (current.parent === pParent) {
            return existing;
          }
          existing[pParent].children = this.createVirtualChildModel(child, existing[pParent]);
        }
        return existing;
      } else if (rowDifference <= -1) {
        const previousParent = existing[parent] ? existing[parent] : null;
        existing[parent].children = this.createVirtualChildModel(child, previousParent);
        return existing;
      }
    } catch (ex) {
      throw ex;
    }
  }

  hideCommonChildren(existing: any, current: any) {
    try {
      const child = current.child;
      const pParent = existing[child].parent;
      const previousParent = existing[pParent];
      const findIndex = previousParent.children.findIndex((pre: any) => pre.child === child);
      if (findIndex > -1) {
        // previousParent.children[findIndex].displayEnum = 'hide';
      }
      return existing;
    } catch (ex) {
      throw ex;
    }
  }

  createVirtualChildModel(currentChild: any, item: any) {
    try {
      const uniqueId = Math.random().toString(16).slice(10);
      const existingChildren = this.updateRowIndex(item.children);
      return [{
        rowIndex: item.rowIndex + 1,
        set: 1,
        child: currentChild,
        parent: item.child,
        children: existingChildren,
        displayName: `${item.displayName}_${uniqueId}`,
        sameChildren: [],
        childrenCount: 0,
        connectorChildren: [],
        virtualChild: true,
        needToPositioning: false,
        displayEnum: 'bottomLine'
      }];
    } catch (ex) {
      throw ex;
    }
  }

  updateRowIndex(children: Array<any>): Array<any> {
    try {
      if (!children || children.length === 0) {
        return children;
      }
      for (const item of children) {
        item.rowIndex = item.rowIndex > 0 ? item.rowIndex + 1 : 1;
        this.updateRowIndex(item.children);
      }
      return children;
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
        for (const vChild of virtualChildren) {
          previousParent = vChild;
          this.getPreviousParentRowIndex(vChild);
        }
      }
      return previousParent.rowIndex;
    } catch (ex) {
      throw ex;
    }
  }

  getPreviousParent(child: any, existing: any) {
    const pParent = existing[child].parent;
    return existing[pParent];
  }
}


// Need to find each node of the height
// If two node height is difference the find the how much difference of the node height and add 24px addition with that

