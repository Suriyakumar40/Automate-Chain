import { Component, OnInit } from '@angular/core';
import { ChainService } from 'src/app/services/chain.service';

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
  public extractCSVModel: Array<any> = [];
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
        this.extractCSVModel = items.map(it => {
          const [set, child, parent, displayName] = it ? it.split(',') : [];
          return {
            set: set,
            child: child,
            parent: parent,
            displayName: displayName,
            sameChildren: [],
            childrenCount: 0,
            bottomLineAutoHeight: '',
            connectorChildren: [],
            needToPositioning: false
          };
        }).filter(it => parseInt(it.set) === this.set);
        this.chainModel = this.constructParentAndChild(this.extractCSVModel);
        console.log(this.chainModel);
      }
    });
  }

  constructParentAndChild(items: Array<any>) {
    // https://stackoverflow.com/questions/18017869/build-tree-array-from-flat-array-in-javascript
    if (!items || items.length === 0) {
      return [];
    }
    const result = items.reduce((previous: any, current: any) => {
      current = Object.assign({}, current);
      const parent = current.parent;
      const child = current.child;
      current.children = [];
      previous[parent] = previous[parent] ? previous[parent] : {};
      previous[parent].children = previous[parent].children ? previous[parent].children : [];
      previous[parent].children.push(current);
      if (parent !== 'None') {
        previous[parent].childrenCount = previous[parent].childrenCount + 1;
      }
      if (previous[child] && Object.keys(previous[child]).length > 0) {
        const pParent = previous[child].parent;
        const previousParent = previous[pParent]
        const findIndex = previousParent.children.findIndex((pre: any) => pre.child === child);
        previousParent.class = '';
        current.needToPositioning = true;
        if (findIndex > -1) {
          previousParent.children.splice(findIndex, 1);

        }
        if (!previousParent.sameChildren.some((it: any) => it === child)) {
          previousParent.sameChildren.push(child);
        }
        if (!previous[parent].sameChildren.some((it: any) => it === child)) {
          previous[parent].sameChildren.push(child);
        }
        if (!previousParent.connectorChildren.some((it: any) => it === parent)) {
          previousParent.connectorChildren.push(parent);
        }
        if (!previous[parent].connectorChildren.some((it: any) => it === pParent)) {
          previous[parent].connectorChildren.push(pParent);
        }
      }
      previous[child] = current;
      return previous;
    }, {});

    return result['None'].children;
  }

  counter(length: any) {
    if (length === 0) {
      return new Array();
    }

    return new Array((length * 2) - 2);
  }

}


// Need to find each node of the height
// If two node height is difference the find the how much difference of the node height and add 24px addition with that

