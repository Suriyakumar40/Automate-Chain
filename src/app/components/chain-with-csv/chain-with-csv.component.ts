import { Component, OnInit } from '@angular/core';
import { ChainService } from 'src/app/services/chain.service';

@Component({
  selector: 'app-chain-with-csv',
  templateUrl: './chain-with-csv.component.html',
  styleUrls: ['./chain-with-csv.component.scss']
})
export class ChainWithCSVComponent implements OnInit {

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
    this.chainService.getCSVData().subscribe(data => {
      const items = data ? data.replace(this.header, '').split('\r\n').filter(it => it) : [];
      if (items && items.length > 0) {
        this.extractCSVModel = items.map(it => {
          const [set, child, parent, displayName] = it ? it.split(',') : [];
          return {
            set: set,
            child: child,
            parent: parent,
            displayName: displayName
          };
        }).filter(it => parseInt(it.set) === this.set);
        this.chainModel = this.constructParentAndChild(this.extractCSVModel);
      }
    });
  }

  constructParentAndChild(items: Array<any>) {
    // https://stackoverflow.com/questions/18017869/build-tree-array-from-flat-array-in-javascript
    if (!items || items.length === 0) {
      return [];
    }
    const result = items.reduce((previous: any, current: any) => {
      const parent = current.parent;
      const child = current.child;
      current.children = [];
      previous[parent] = previous[parent] ? previous[parent] : {};
      previous[parent].children = previous[parent].children ? previous[parent].children : [];
      previous[parent].children.push(current);
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

