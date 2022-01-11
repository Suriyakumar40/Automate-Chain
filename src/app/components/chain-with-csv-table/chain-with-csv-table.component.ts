import { Component, OnInit } from '@angular/core';
import { ChainService } from 'src/app/services/chain.service';

export type DisplayEnumType = 'show | drawHorizontalLine | drawVerticalLine' | 'commonChildConnector';
export type childPoint = 'start' | 'end';
export type rowEnum = 'split' | 'merge' | 'multiplemerge';

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
            rowIndex: 0,
            set: set, // temporary
            child: child,
            parent: parent,
            displayName: displayName,
            displayEnum: 'show',
            virtualChild: false,
            commonChildPoistion: '',
            dummyVerticalLine: '',
            parentLists: [],
            documentNumber: documentNumber,
            executantName: executantName,
            claimantName: claimantName,
            dor: dor,
            nature: nature,
            marketValue: marketValue,
            considerationValue: considerationValue,
            surveyNumber: surveyNumber,
            propertySize: propertySize,
          };
        }).filter(it => parseInt(it.set) === this.set);
        const reconstructDataModel = this.centerAlignCommonChild(extractDataModel);
        this.extractDataModel = this.constructDataModel(reconstructDataModel);
        this.chainModel = this.constructParentAndChild(this.extractDataModel);
        console.log(this.chainModel);
      }
    });
  }

  centerAlignCommonChild(items: Array<any>) {
    try {
      if (!items || items.length === 0) {
        return [];
      }
      const count = this.groupByWithCount(items);
      const multipleItems = Object.keys(count).filter((key: any) => count[key] > 1);
      for (const child of multipleItems) {
        const children = items.filter(it => it.child === child);
        const lastChild = children[children.length - 1];
        const lastIndex = items.findIndex((it: any) => it.child === child && it.parent === lastChild.parent);
        const cloneChild = Object.assign({}, children[0]);
        const childrenLength = children && children.length ? children.length : 0
        const isEven = this.numberIsEven(childrenLength);
        const selectChildIndex = (childrenLength / 2) - 1;
        const guid = this.generateGUID();
        if (isEven && children[selectChildIndex]) {
          const selectParent = children[selectChildIndex].parent;
          const parentIndex = items.findIndex(it => it.child === selectParent);
          const previousParent = parentIndex > -1 ? items[parentIndex].parent : null;
          const virutalParentEntry = { child: guid, parent: previousParent, displayName: guid, virtualChild: true, displayEnum: 'commonChildConnector' };
          items.splice(parentIndex + 1, 0, virutalParentEntry);
          const virtualChildEntry = cloneChild;
          virtualChildEntry['parent'] = guid;
          items.splice(lastIndex + 2, 0, virtualChildEntry);
        }
      }
      items = items.map((it: any, index) => {
        it['index'] = index;
        return it;
      });
      return items;
    } catch (ex) {
      throw ex;
    }
  }

  constructDataModel(items: Array<any>) {
    try {
      if (!items || items.length === 0) {
        return [];
      }
      const result: any = {};
      const poistion: any = {};
      for (const item of items) {
        const child = item.child;
        const parent = item.parent;
        result[child] = result[child] ? result[child] : [];
        if (result[child].length > 0) {
          const previousParent = result[child][0];
          poistion[child] = this.findCommonChildrenStartandEnd(previousParent, parent, child, items, poistion[child]);
        }
        item.parentLists = result[child];
        result[child].push(parent);
      }
      for (const child of Object.keys(poistion)) {
        const commonChildren = items.filter(it => it.child === child);
        for (const commonChild of commonChildren) {
          commonChild.displayEnum = 'drawHorizontalLine';
          commonChild.commonChildPoistion = this.getCommonChildPoistion(commonChild.parent, poistion[child]);
          if (commonChild.commonChildPoistion === 'middle') {
            commonChild.displayEnum = 'show';
          }
        }
      }
      return items;
    } catch (ex) {
      throw ex;
    }
  }

  findCommonChildrenStartandEnd(pParent: any, parent: any, child: any, items: Array<any>, existingPoint: any) {
    try {
      existingPoint = existingPoint ? existingPoint : {};
      const plength = Object.keys(existingPoint).length;
      if (plength === 0) {
        existingPoint['startParent'] = existingPoint['endParent'] = pParent;
      }
      const isStartChild = this.findStartingDestination(items, existingPoint['startParent'], parent, child);
      const isEndChild = this.findEndingDestination(items, existingPoint['endParent'], parent, child);
      const isMiddleChild = this.findMiddleDestination(items, existingPoint['startParent'], existingPoint['endParent'], parent, child);
      existingPoint['startParent'] = isStartChild ? parent : existingPoint['startParent'];
      existingPoint['middleParent'] = isMiddleChild ? parent : existingPoint['middleParent'];
      existingPoint['endParent'] = isEndChild ? parent : existingPoint['endParent'];
      return existingPoint;
    } catch (ex) {
      throw ex;
    }
  }

  findStartingDestination(items: Array<any>, startParent: any, currentParent: any, child: any, breakNode: any = 'None'): any {
    try {
      const previous = this.findRootParent(items, startParent, child, breakNode);
      const current = this.findRootParent(items, currentParent, child, breakNode);
      if (previous.parent === current.parent) {
        return this.findStartingDestination(items, startParent, currentParent, child, previous.parent);
      } else {
        return current.index < previous.index;
      }
    } catch (ex) {
      throw ex;
    }
  }

  findEndingDestination(items: Array<any>, endParent: any, currentParent: any, child: any, breakNode: any = 'None'): any {
    try {
      const previous = this.findRootParent(items, endParent, child, breakNode);
      const current = this.findRootParent(items, currentParent, child, breakNode);
      if (previous.parent === current.parent) {
        return this.findEndingDestination(items, endParent, currentParent, child, previous.parent);
      } else {
        return current.index > previous.index;
      }
    } catch (ex) {
      throw ex;
    }
  }

  findMiddleDestination(items: Array<any>, startParent: any, endParent: any, currentParent: any, child: any, breakNode: any = 'None'): any {
    try {
      const previousStartParent = this.findRootParent(items, startParent, child, breakNode);
      const previousEndParent = this.findRootParent(items, endParent, child, breakNode);
      const current = this.findRootParent(items, currentParent, child, breakNode);
      if (previousStartParent.parent === current.parent || previousEndParent.parent === current.parent) {
        return this.findMiddleDestination(items, startParent, endParent, currentParent, child, previousStartParent.parent);
      } else {
        return current.index < previousStartParent.index < previousEndParent.index;
      }
    } catch (ex) {
      throw ex;
    }
  }

  findRootParent(items: Array<any>, parent: any, child: any, breakNode: any): any {
    try {
      const result = { parent: '', index: 0 };
      if (parent === breakNode) {
        const childItem = items.find(it => it.child === child && it.parent === parent);
        result.parent = childItem.parent;
        result.index = childItem.index;
      } else {
        const previousParent = items.find(it => it.child === parent);
        if (previousParent && previousParent.parent === breakNode) {
          result.parent = previousParent.child;
          result.index = previousParent.index;
        } else if (previousParent) {
          return this.findRootParent(items, previousParent.parent, child, breakNode);
        }
      }
      return result;
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
      let mapItems = items.reduce((result: any, current: any, index) => {
        current = Object.assign({}, current);
        current.children = [];
        const parent = current.parent;
        const child = current.child;
        result[parent] = result[parent] ? result[parent] : {};
        const currentParent = result[parent];
        currentParent.children = currentParent.children ? currentParent.children : [];
        currentParent.children.push(current);
        current.rowIndex = this.incrementRowIndex(currentParent.rowIndex);
        this.rcIndex[current.rowIndex] = 1;
        if (result[child] && Object.keys(result[child]).length > 0) {
          result = this.createVirtualNode(result, current);
        }
        result[child] = current;
        return result;
      }, {});
      mapItems = this.findDummbyVerticalLine(this.rcIndex, mapItems);
      return mapItems['None'].children;
    } catch (ex) {
      throw ex;
    }
  }

  createVirtualNode(result: any, current: any) {
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
      const [currentParentIndex] = this.getCurrentParentRowIndex(child, currentParent);
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
        const uniqueId = this.generateGUID();
        const existingChildren = this.updateRowIndex(findChild);
        const newVirtualChild = {
          rowIndex: existingChildren.rowIndex - 1,
          set: 1,
          child: currentChild,
          parent: findChild.parent,
          children: [existingChildren],
          displayName: `${uniqueId}`,
          virtualChild: true,
          commonChildPoistion: existingChildren.commonChildPoistion,
          displayEnum: 'drawVerticalLine'
        };
        children[findIndex] = Object.assign({}, newVirtualChild);
      }
      return children;
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
      for (const node of renderChild.children) {
        node.rowIndex = this.incrementRowIndex(node.rowIndex);
        this.updateRowIndex(node.children);
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
      const findChild = currentParent.children.find((it: any) => !it.virtualChild && it.child === child);
      if (findChild) {
        return [currentParent.rowIndex, findChild.rowIndex];
      } else {
        let [parentRowIndex, childRowIndex]: any = [0, 0];
        for (const item of currentParent.children) {
          [parentRowIndex, childRowIndex] = this.getCurrentParentRowIndex(child, item);
        }
        return [parentRowIndex, childRowIndex];
      }
    } catch (ex) {
      throw ex;
    }
  }

  findDummbyVerticalLine(rowIndex: any, mappedObj: any) {
    try {
      const rows = Object.keys(rowIndex);
      for (const r of rows) {
        const row = parseInt(r);
        const rowItems = this.getItemsByRowIndex(row, mappedObj);
        const filterSingleChildren = rowItems.filter(it => it.children.length === 1);
        const findMultipleChildren = rowItems.filter(it => it.children.length > 1);
        const singleChildren = [];
        for (const childObj of filterSingleChildren) {
          const child = childObj.child;
          const commonChildObj = this.findCommonChildren(child, mappedObj);
          const isCommonChild = commonChildObj ? commonChildObj.childRowIndex - childObj.rowIndex === 1 : false;
          if (!isCommonChild) {
            singleChildren.push(child)
          }
        }
        if (filterSingleChildren.length !== singleChildren.length || findMultipleChildren.length > 0) {
          for (const skey of singleChildren) {
            mappedObj[skey].dummyVerticalLine = true;
          }
        }
      }
      return mappedObj;
    } catch (ex) {
      throw ex;
    }
  }

  // below function find the common children of the parent which passed as parameter
  findCommonChildren(parent: any, mappedObj: any) {
    try {
      const parentObj = mappedObj[parent];
      const children = parentObj.children && parentObj.children.length > 0 ? parentObj.children : [];
      const result: any = {};
      for (const node of children) {
        const selectedNode = mappedObj[node.child];
        const parentLists = selectedNode && selectedNode.parentLists ? selectedNode.parentLists : [];
        const isParentExist = parentLists.length > 1 && parentLists.some((it: any) => it === parent);
        if (isParentExist) {
          const [parentRowIndex, childRowIndex] = this.getCurrentParentRowIndex(node.child, parentObj);
          result['parent'] = node.parent;
          result['child'] = node.child;
          result['parentRowIndex'] = parentRowIndex;
          result['childRowIndex'] = childRowIndex;
        }
      }
      return result;
    } catch (ex) {
      throw ex;
    }
  }

  getItemsByRowIndex(rowIndex: any, mappedObj: any) {
    try {
      return Object.keys(mappedObj).map(k => {
        const obj = mappedObj[k];
        if (k !== 'None' && obj.rowIndex === rowIndex) {
          return Object.assign({}, obj);
        }
      }).filter(it => it);
    } catch (ex) {
      throw ex;
    }
  }

  groupByWithCount(items: Array<any>) {
    if (!items || items.length === 0) {
      return null;
    }
    return items.reduce((previous, current) => {
      const child = current.child;
      const count = previous[child] ? previous[child] : 0
      previous[child] = count + 1;
      return previous;
    }, {});
  }

  getCommonChildPoistion(parent: any, poistion: any) {
    if (parent === poistion.startParent) {
      return 'start';
    } else if (parent === poistion.middleParent) {
      return 'middle';
    } else if (parent === poistion.endParent) {
      return 'end';
    }
    return '';
  }

  getPreviousParent(child: any, result: any) {
    const pParent = result[child].parent;
    return result[pParent];
  }

  incrementRowIndex(rowIndex: number) {
    return rowIndex > 0 ? rowIndex + 1 : 1
  }

  numberIsEven(number: any) {
    number = parseInt(number);
    return number % 2 === 0;
  }

  generateGUID() {
    return Math.random().toString(16).slice(8);
  }
}


// Need to find each node of the height
// If two node height is difference the find the how much difference of the node height and add 24px addition with that

