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
            index: index,
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
        const dataModelPosition = this.setPoistion(extractDataModel);
        this.extractDataModel = this.createChildForMiddlePosition(dataModelPosition);
        this.chainModel = this.constructParentAndChild(this.extractDataModel);
        console.log(this.chainModel);
      }
    });
  }

  createChildForMiddlePosition(items: Array<any>) {
    try {
      if (!items || items.length === 0) {
        return [];
      }
      items = items.map(it => Object.assign({}, it));
      const count = this.groupByWithCount(items);
      const multipleItems = Object.keys(count).filter((key: any) => count[key] > 1);
      for (const child of multipleItems) {
        const findMiddleIndex = items.findIndex(it => it.child === child && it.commonChildPoistion === 'middle');
        const findStartIndex = items.findIndex(it => it.child === child && it.commonChildPoistion === 'start');
        const children = items.filter(it => it.child === child);
        const isEven = this.numberIsEven(children.length);
        const guid = this.generateGUID();
        if (isEven && findMiddleIndex === -1 && findStartIndex) {
          const insertPoistion: any = this.findCommonChildInsertPoistion(items, children);
          if (insertPoistion.index > -1) {
            const virutalParentEntry = {
              child: guid,
              parent: insertPoistion.parent,
              displayName: guid,
              virtualChild: true,
              displayEnum: 'commonChildConnector',
              rowIndex: 0,
              parentLists: [],
            };
            items.splice(insertPoistion.index + 1, 0, virutalParentEntry);
            const virtualChildEntry = Object.assign({}, children[0]);
            virtualChildEntry['parent'] = guid;
            virtualChildEntry['commonChildPoistion'] = 'middle';
            virtualChildEntry['displayEnum'] = 'show';
            items.splice(findStartIndex + 1, 0, virtualChildEntry);
            items = this.setIndex(items);
          }
        }
      }
      const result: any = {};
      for (const item of items) {
        const child = item.child;
        const parent = item.parent;
        result[child] = result[child] ? result[child] : [];
        item.parentLists = result[child];
        result[child].push(parent);
      }
      return items;
    } catch (ex) {
      throw ex;
    }
  }

  setPoistion(items: Array<any>) {
    try {
      if (!items || items.length === 0) {
        return [];
      }
      const result: any = {};
      const poistion: any = {};
      items = items.map(it => Object.assign({}, it));
      for (const item of items) {
        const child = item.child;
        const parent = item.parent;
        result[child] = result[child] ? result[child] : [];
        if (result[child].length > 0) {
          const previousParent = result[child][0];
          poistion[child] = this.findCommonChildrenPoistion(previousParent, parent, child, items, poistion[child]);
        }
        item.parentLists = result[child];
        result[child].push(parent);
      }
      for (const child of Object.keys(poistion)) {
        const commonChildren = items.filter(it => it.child === child);
        poistion[child].middleParent = this.findMiddlePoistion(items, poistion[child], child);
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

  findCommonChildrenPoistion(pParent: any, parent: any, child: any, items: Array<any>, existingPoistion: any) {
    try {
      existingPoistion = existingPoistion ? existingPoistion : {};
      const plength = Object.keys(existingPoistion).length;
      if (plength === 0) {
        const isStart = this.findStartPoistion(items, pParent, parent, child);
        existingPoistion['startParent'] = isStart ? parent : pParent;
        existingPoistion['endParent'] = isStart ? pParent : parent;
      } else {
        const isStart = this.findStartPoistion(items, existingPoistion['startParent'], parent, child);
        const isEnd = this.findEndPoistion(items, existingPoistion['endParent'], parent, child);
        existingPoistion['startParent'] = isStart ? parent : existingPoistion['startParent'];
        existingPoistion['endParent'] = isEnd ? parent : existingPoistion['endParent'];
      }
      return existingPoistion;
    } catch (ex) {
      throw ex;
    }
  }

  findStartPoistion(items: Array<any>, startParent: any, currentParent: any, child: any, breakNode: any = 'None'): any {
    try {
      const previous = this.findRootParent(items, startParent, child, breakNode);
      const current = this.findRootParent(items, currentParent, child, breakNode);
      if (previous.parent === current.parent) {
        return this.findStartPoistion(items, startParent, currentParent, child, previous.parent);
      } else {
        return current.index < previous.index;
      }
    } catch (ex) {
      throw ex;
    }
  }

  findMiddlePoistion(items: Array<any>, existingPoistion: any, child: any, breakNode: any = 'None'): any {
    try {
      const startParent = existingPoistion['startParent'];
      const endParent = existingPoistion['endParent'];
      const result: any = {};
      const children = items.filter(it => it.child === child);
      for (const commonChild of children) {
        const currentParent = commonChild.parent;
        if (currentParent !== startParent && currentParent !== endParent) {
          const rootParent = this.findRootParent(items, currentParent, child, breakNode);
          const previousParent = result[rootParent.index] ? result[rootParent.index].parent : null
          const commonParent = this.iterateCommonChildren(items, previousParent, currentParent, child, breakNode);
          result[rootParent.index] = { index: rootParent.index, parent: commonParent };
        }
      }
      if (result) {
        const keys = Object.keys(result);
        const index = Math.round(keys.length / 2) - 1;
        const findKey: any = keys.find((it, kIndex) => kIndex == index);
        return result[findKey] ? result[findKey].parent : null
      }
      return result;
    } catch (ex) {
      throw ex;
    }
  }

  iterateCommonChildren(items: Array<any>, previousParent: any, currentParent: any, child: any, breakNode: any): any {
    const previous = this.findRootParent(items, previousParent, child, breakNode);
    const current = this.findRootParent(items, currentParent, child, breakNode);
    if (previous.parent === current.parent) {
      return this.iterateCommonChildren(items, previousParent, currentParent, child, current.parent);
    } else if (previous.index > 0 && current.index > 0) {
      return previous.index < current.index ? previousParent : currentParent;
    }
    return currentParent;
  }

  findEndPoistion(items: Array<any>, endParent: any, currentParent: any, child: any, breakNode: any = 'None'): any {
    try {
      const previous = this.findRootParent(items, endParent, child, breakNode);
      const current = this.findRootParent(items, currentParent, child, breakNode);
      if (previous.parent === current.parent) {
        return this.findEndPoistion(items, endParent, currentParent, child, previous.parent);
      } else {
        return current.index > previous.index;
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

  findCommonChildInsertPoistion(items: Array<any>, children: Array<any>) {
    return children.reduce((previous, current) => {
      if (Object.keys(previous).length === 0) {
        previous = { index: 0, parent: current.parent };
      } else {
        previous = this.iteratePreviousParent(items, previous.parent, current.parent);
      }
      return previous;
    }, {});
  }

  iteratePreviousParent(items: Array<any>, previousNode: any, currentNode: any): any {
    try {
      const previousIndex = items.findIndex(it => it.child === previousNode);
      const currentIndex = items.findIndex(it => it.child === currentNode);
      const previous = previousIndex > -1 ? items[previousIndex] : null;
      const current = currentIndex > -1 ? items[currentIndex] : null;
      previousNode = previous.parent === 'None' ? previousNode : previous.parent;
      currentNode = current.parent === 'None' ? currentNode : current.parent;
      if (previous && current && previous.parent === current.parent) {
        const startPosition = this.findStartPoistion(items, previous.child, current.child, '');
        const rootParentIndex = startPosition ? currentIndex : previousIndex;
        return { index: rootParentIndex, parent: current.parent };
      }
      return this.iteratePreviousParent(items, previousNode, currentNode);
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
        const middleKey = `middle_${parent}`;
        const middleParent = result[middleKey] || null;
        result[parent] = result[parent] ? result[parent] : {};
        const currentParent = middleParent ? middleParent : result[parent];
        currentParent.children = currentParent.children ? currentParent.children : [];
        currentParent.children.push(current);
        current.rowIndex = this.incrementRowIndex(currentParent.rowIndex);
        this.rcIndex[current.rowIndex] = 1;
        if (result[child] && Object.keys(result[child]).length > 0) {
          result = this.createVirtualNode(result, current);
        }
        result[child] = current;
        if (current.commonChildPoistion === 'middle') {
          result[`middle_${child}`] = current;
        }
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
          const selectChild = current.child;
          const findIndex = result[parent].children.findIndex((it: any) => it.parent === parent && it.child === selectChild);
          current = this.virtualChildModel_new(current, current.parent, result);
          result[parent].children[findIndex] = current;
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
        if (findIndex > -1) {
          const rowDifference: number = this.calculateRowDistance(child, result[pParent], result[parent]);
          if (rowDifference > 0) {
            for (let i = 0; i < rowDifference; i++) {
              let selectChild = current.child;
              const previousParent =  result[`middle_${pParent}`] ? result[`middle_${pParent}`] : result[pParent];
              const findIndex = previousParent.children.findIndex((it: any) => it.child === selectChild);
              const virtualChild = this.virtualChildModel_new(result[pParent].children[findIndex], pParent, result);
              result[pParent].children[findIndex] = virtualChild;
              selectChild = virtualChild.child;
              // const childrenLists = this.virtualChildModel(child, pParent, result);
              // result[pParent].children = childrenLists;
            }
          }
        }
      }
      return result;
    } catch (ex) {
      throw ex;
    }
  }

  virtualChildModel_new(current: any, previousParent: any, result: any) {
    try {
      current = Object.assign({}, current);
      const uniqueId: any = this.generateGUID();
      const existingChildren = this.updateRowIndex(current, uniqueId);
      const isCommonChildConnector = result[previousParent].displayEnum === 'commonChildConnector'
      const newVirtualChild = {
        rowIndex: existingChildren.rowIndex - 1,
        set: 1,
        child: uniqueId,
        parent: previousParent,
        children: [existingChildren],
        displayName: `${uniqueId}`,
        virtualChild: true,
        dummyVerticalLine: false,
        parentLists: [],
        displayEnum: isCommonChildConnector ? 'commonChildConnector' : 'drawVerticalLine'
      };
      existingChildren.parentLists.push(uniqueId);
      result[uniqueId] = newVirtualChild;
      return newVirtualChild;
    } catch (ex) {
      throw ex;
    }
  }

  virtualChildModel(currentChild: any, parent: any, result: Array<any>) {
    try {
      const children = this.findChildren(currentChild, result[parent].children);
      const findIndex = children ? children.findIndex((it: any) => it.child === currentChild) : -1;
      if (findIndex > -1) {
        const findChild = children[findIndex];
        const uniqueId: any = this.generateGUID();
        const previousParent = findChild.parent;
        const existingChildren = this.updateRowIndex(findChild, uniqueId);
        const isCommonChildConnector = result[parent].displayEnum === 'commonChildConnector'
        const newVirtualChild = {
          rowIndex: existingChildren.rowIndex - 1,
          set: 1,
          child: uniqueId,
          parent: previousParent,
          children: [existingChildren],
          displayName: `${uniqueId}`,
          virtualChild: true,
          dummyVerticalLine: false,
          displayEnum: isCommonChildConnector ? 'commonChildConnector' : 'drawVerticalLine'
        };
        existingChildren.parentLists.push(uniqueId);
        children[findIndex] = Object.assign({}, newVirtualChild);
        result[uniqueId] = newVirtualChild;
      }
      return result[parent].children;
    } catch (ex) {
      throw ex;
    }
  }

  findChildren(childNode: any, children: any): any {
    try {
      const isExists = children.some((it: any) => it.child === childNode);
      if (isExists) {
        return children;
      } else {
        for (const child of children) {
          return this.findChildren(childNode, child.children);
        }
      }
    } catch (ex) {
      throw ex;
    }
  }

  updateRowIndex(child: any, uniqueId: any): any {
    try {
      const renderChild = Object.assign({}, child);
      renderChild.parent = uniqueId;
      renderChild.rowIndex = this.incrementRowIndex(renderChild.rowIndex);
      if (!renderChild.children || renderChild.children.length === 0) {
        return renderChild;
      }
      for (const node of renderChild.children) {
        node.child = uniqueId;
        node.rowIndex = this.incrementRowIndex(node.rowIndex);
        this.updateRowIndex(node.children, uniqueId);
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
            const parent = mappedObj[skey].parent;
            mappedObj[skey].dummyVerticalLine = true;
            // const children = this.findChildren(skey, mappedObj[parent].children);
            // if (children && children.length > 0) {
            //   children[0].dummyVerticalLine = true
            // }
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

  setIndex(items: Array<any>) {
    if (!items || items.length === 0) {
      return [];
    }
    return items = items.map((it: any, index) => {
      it.index = index;
      return it;
    });
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

  adjustVerticalLine(childItem: any) {
    const nodeDataHeight = this.getNodeDataHeight();
    const downLineHeight = this.getDownLineHeight();
    const splitMergeLineHeight = this.getSplitOrMergeLineConnector();
    if (childItem.displayEnum === 'commonChildConnector' && childItem.dummyVerticalLine) {
      return `${downLineHeight + nodeDataHeight + splitMergeLineHeight + 4}px`;
    } else if (childItem.displayEnum === 'commonChildConnector') {
      return `${downLineHeight + nodeDataHeight + 2}px`
    } else if (childItem.dummyVerticalLine) {
      return `${downLineHeight + splitMergeLineHeight + 2}px`;
    }
    return `${downLineHeight}px`;
  }

  getDownLineHeight() {
    const downLineDOM = document.getElementById(`downLine`);
    return downLineDOM && downLineDOM.offsetHeight > 0 ? downLineDOM.offsetHeight : 0
  }

  getNodeDataHeight() {
    const nodeDataDOM = document.getElementById(`node-data`);
    return nodeDataDOM && nodeDataDOM.offsetHeight > 0 ? nodeDataDOM.offsetHeight : 0
  }

  getNodeDataWidth() {
    const nodeDataDOM = document.getElementById(`node-data`);
    return nodeDataDOM && nodeDataDOM.offsetWidth > 0 ? nodeDataDOM.offsetWidth : 0
  }

  getSplitOrMergeLineConnector() {
    return 24;
  }
}


// Need to find each node of the height
// If two node height is difference the find the how much difference of the node height and add 24px addition with that

