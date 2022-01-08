import { Component, OnInit } from '@angular/core';
import { ChainService } from 'src/app/services/chain.service';

export type DisplayEnumType = 'show | drawHorizontalLine | drawVerticalLine';
export type childPoint = 'start' | 'end';

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
  public header = `Set,Child,Parent,DisplayName,Document Number
    ,Executant Name,Claimant Name,DOR,Nature,Market value,Consideration value,SurveyNumbers,PropertySize`;
  public rcIndex: any = {}; // row as key and latest columnindex is value

  constructor(private chainService: ChainService) {
  }

  ngOnInit(): void {
    const sheetName = 'chain-data-table.csv';
    this.chainService.getCSVData(sheetName).subscribe(data => {
      const items = data ? data.replace(this.header, '').split('\r\n').filter(it => it) : [];
      if (items && items.length > 0) {
        const extractDataModel = items.map((it: any, index: number) => {
          const [set, child, parent, displayName, documentNumber
            , executantName, claimantName, dor, nature, marketValue
            , considerationValue, surveyNumber, propertySize] = it ? it.split(',') : [];
          return {
            index: index,
            rowIndex: 0,
            columnIndex: 0,
            set: set, // temporary
            child: child,
            parent: parent,
            displayName: displayName,
            displayEnum: 'show',
            virtualChild: false,
            needToPositioning: false,
            commonChildPoint: '',
            parentLists: [],
            documentNumber: documentNumber,
            executantName: executantName,
            claimantName: claimantName,
            dor: dor,
            nature: nature,
            marketValue: marketValue,
            considerationValue: considerationValue,
            surveyNumber: surveyNumber,
            propertySize: propertySize
          };
        }).filter(it => parseInt(it.set) === this.set);
        this.extractDataModel = this.constructDataModel(extractDataModel);
        this.chainModel = this.constructParentAndChild(this.extractDataModel);
        console.log(this.chainModel);
      }
    });
  }

  constructDataModel(items: Array<any>) {
    try {
      if (!items || items.length === 0) {
        return [];
      }
      const result: any = {};
      const startandEndPoint: any = {};
      for (const item of items) {
        const child = item.child;
        const parent = item.parent;
        result[child] = result[child] ? result[child] : [];
        if (result[child].length > 0) {
          const previousParent = result[child][0];
          startandEndPoint[child] = this.findCommonChildrenStartandEnd(previousParent, parent, child, items, startandEndPoint[child]);
          const parentLists = result[child];
          const lastParent = parentLists[parentLists.length - 1];
          const findParent = items.find(it => it.parent === lastParent && it.child === child);
          findParent.displayEnum = 'drawHorizontalLine';
          findParent.needToPositioning = false;
          item.needToPositioning = true;
        }
        item.parentLists = result[child];
        result[child].push(parent);
      }
      if (startandEndPoint) {
        for (const child of Object.keys(startandEndPoint)) {
          const startParent = startandEndPoint[child] ? startandEndPoint[child].startParent : null;
          const endParent = startandEndPoint[child] ? startandEndPoint[child].endParent : null;
          const findStartItem = items.find(it => it.parent === startParent && it.child === child);
          findStartItem.commonChildPoint = 'start';
          const findEndItem = items.find(it => it.parent === endParent && it.child === child);
          findEndItem.commonChildPoint = 'end';
        }
      }
      return items;
    } catch (ex) {
      throw ex;
    }
  }

  findCommonChildrenStartandEnd(pParent: any, parent: any, child: any, items: Array<any>, startandEndPoint: any) {
    try {
      startandEndPoint = startandEndPoint ? startandEndPoint : {};
      const plength = Object.keys(startandEndPoint).length;
      let previousStartParent, previousEndParent = '';
      if (plength === 0) {
        previousStartParent = previousEndParent = this.findRootParentIndex(pParent, child, items);
        startandEndPoint['startParent'] = startandEndPoint['endParent'] = pParent;
      } else {
        previousStartParent = this.findRootParentIndex(startandEndPoint.startParent, child, items);
        previousEndParent = this.findRootParentIndex(startandEndPoint.endParent, child, items);
      }
      const current = this.findRootParentIndex(parent, child, items);
      const isStartChild = this.findStartPoint(previousStartParent, current);
      const isEndChild = this.findEndPoint(previousEndParent, current);
      startandEndPoint['startParent'] = isStartChild ? parent :  startandEndPoint['startParent'] ;
      startandEndPoint['endParent'] = isEndChild ? parent :  startandEndPoint['endParent'] ;
      return startandEndPoint;
    } catch (ex) {
      throw ex;
    }
  }

  findStartPoint(previous: any, current: any) {
    try {
      const isRootParentSame = previous.rootParent === current.rootParent;
      if (isRootParentSame) {
        return current.childOfRootParentIndex < previous.childOfRootParentIndex;
      } else {
        return current.rootParentIndex < previous.rootParentIndex;
      }
    } catch (ex) {
      throw ex;
    }
  }

  findEndPoint(previous: any, current: any) {
    try {
      const isRootParentSame = previous.rootParent === current.rootParent;
      if (isRootParentSame) {
        return current.childOfRootParentIndex > previous.childOfRootParentIndex;
      } else {
        return current.rootParentIndex > previous.rootParentIndex;
      }
    } catch (ex) {
      throw ex;
    }
  }

  findRootParentIndex(parent: any, child: any, items: Array<any>): any {
    try {
      const previousParent = items.find(it => it.child === parent);
      if (previousParent && previousParent.parent === 'None') {
        const childOfRootParent = items.find(it => it.parent === previousParent.child && it.child === child);
        return {
          rootParent: previousParent.child,
          rootParentIndex: previousParent.index,
          childOfRootParent: childOfRootParent.child,
          childOfRootParentIndex: childOfRootParent.index,
        };
      } else if (previousParent) {
        const childOfRootParent = this.findRootParentIndex(previousParent.parent, previousParent.child, items);
        return childOfRootParent;
      }
    } catch (ex) {
      throw ex;
    }
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
        current.rowIndex = this.incrementRowIndex(currentParent.rowIndex);
        current.columnIndex = this.incrementColumnIndex(current.rowIndex);
        current.commonChildDestination = current.parentLists.length >= 2 ? 'start' : '';
        this.rcIndex[current.rowIndex] = current.columnIndex;
        // current.rowIndex = this.getRowIndex(result, current);
        if (result[child] && Object.keys(result[child]).length > 0) {
          result = this.createVirtualChildByRow(result, current);
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

  createVirtualChildByRow(result: any, current: any) {
    try {
      const parent = current.parent;
      const child = current.child;
      const currentParent = result[parent];
      const previousParent = this.getPreviousParent(child, result);
      const rowDifference: number = this.calculateRowDistance(child, previousParent, currentParent);
      if (rowDifference > 0) {
        result = this.createVirtualChildForPreviousChildren(result, current);
      } else if (rowDifference <= -1 && result[parent]) {
        for (let i = 0; i < -(rowDifference); i++) {
          const childrenLists = this.virtualChildModel(child, result[parent].children);
          result[parent].children = childrenLists;
        }
      }
      return result;
    } catch (ex) {
      throw ex;
    }
  }

  calculateRowDistance(child: any, previousParent: any, currentParent: any) {
    try {
      const currentParentIndex = this.getCurrentParentRowIndex(child, currentParent);
      const previousParentIndex = this.getPreviousParentRowIndex(previousParent);
      return currentParentIndex - previousParentIndex;
    } catch (ex) {
      throw ex;
    }
  }

  createVirtualChildForPreviousChildren(result: any, current: any) {
    try {
      const parent = current.parent;
      const child = current.child;
      for (const pParent of current.parentLists) {
        if (parent === pParent) {
          return result;
        }
        const findIndex = result[pParent].children.findIndex((it: any) => it.child === child);
        if (findIndex >= -1) {
          const rowDifference: number = this.calculateRowDistance(child, result[pParent], result[parent]);
          if (rowDifference > 0) {
            for (let i = 0; i < rowDifference; i++) {
              const childrenLists = this.virtualChildModel(child, result[pParent].children);
              result[pParent].children = childrenLists;
            }
          }
        }
      }
      return result;
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
        const existingChildren = this.updateRowColumnIndex(findChild);
        const newVirtualChild = {
          rowIndex: existingChildren.rowIndex - 1,
          set: 1,
          child: currentChild,
          parent: findChild.parent,
          children: [existingChildren],
          displayName: `${uniqueId}`,
          virtualChild: true,
          needToPositioning: false,
          commonChildPoint: existingChildren.commonChildPoint,
          displayEnum: 'drawVerticalLine'
        };
        children[findIndex] = Object.assign({}, newVirtualChild);
      }
      return children;
    } catch (ex) {
      throw ex;
    }
  }

  updateRowColumnIndex(child: any): any {
    try {
      const renderChild = Object.assign({}, child);
      renderChild.rowIndex = this.incrementRowIndex(renderChild.rowIndex);
      renderChild.columnIndex = this.incrementColumnIndex(renderChild.rowIndex);
      this.rcIndex[renderChild.rowIndex] = renderChild.columnIndex;
      if (!renderChild.children || renderChild.children.length === 0) {
        return renderChild;
      }
      for (const node of renderChild.children) {
        node.rowIndex = this.incrementRowIndex(node.rowIndex);
        node.columnIndex = this.incrementColumnIndex(node.rowIndex);
        this.rcIndex[node.rowIndex] = node.columnIndex;
        this.updateRowColumnIndex(node.children);
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

  getColumnIndexByChild(child: any, currentParent: any) {
    try {
      const index = currentParent.children.findIndex((it: any) => !it.virtualChild && it.child === child);
      if (index > -1) {
        return currentParent.children[index].columnIndex;
      } else {
        let columnIndex = 0;
        for (const item of currentParent.children) {
          columnIndex = this.getColumnIndexByChild(child, item);
        }
        return columnIndex;
      }
    } catch (ex) {
      throw ex;
    }
  }

  getPreviousParent(child: any, result: any) {
    const pParent = result[child].parent;
    return result[pParent];
  }

  incrementRowIndex(rowIndex: number) {
    return rowIndex > 0 ? rowIndex + 1 : 1
  }

  incrementColumnIndex(rowIndex: number) {
    const latestColumnIndex = this.rcIndex[rowIndex];
    return latestColumnIndex > 0 ? latestColumnIndex + 1 : 1;
  }
}


// Need to find each node of the height
// If two node height is difference the find the how much difference of the node height and add 24px addition with that

