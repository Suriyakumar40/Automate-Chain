import { Component, OnInit } from '@angular/core';
import { OwnershipchainModel } from 'src/app/models/ownership-chain.model';

@Component({
  selector: 'app-chain',
  templateUrl: './chain.component.html',
  styleUrls: ['./chain.component.scss']
})
export class ChainComponent implements OnInit {

  public chainColumnWrapEnabled = false;
  public propertyNumberType = 'SurveyNumber';
  public ownershipChainRequest: Array<Array<OwnershipchainModel>> = [];
  public ecStartDate = '1987'
  public showChainDefaultHeader = true;
  public constants = {};

  constructor() {
    this.ownershipChainRequest = [
      [
        {
          ExecutantName: 'V Sivaji',
          ClaimantName: 'V Revathi',
          DateOfRegistration: '30-Oct-2021',
          TransactionNature: 'Gift Deed',
          ChainMarketValue: '1,05,228',
          ChainConsidrationValue: ' 1,07,000',
          DocumentNumber: '3770',
          SurveyNumbers: '198/2',
          ChainPropertySize: '136.66 Sq.Yds',
        },
        {
          ExecutantName: 'V Sivaji',
          ClaimantName: 'V Revathi',
          DateOfRegistration: '30-Oct-2021',
          TransactionNature: 'Gift Deed',
          ChainMarketValue: '1,05,228',
          ChainConsidrationValue: ' 1,07,000',
          DocumentNumber: '3770',
          SurveyNumbers: '198/2',
          ChainPropertySize: '136.66 Sq.Yds',
        },
        {
          ExecutantName: 'V Sivaji',
          ClaimantName: 'V Revathi',
          DateOfRegistration: '30-Oct-2021',
          TransactionNature: 'Gift Deed',
          ChainMarketValue: '1,05,228',
          ChainConsidrationValue: ' 1,07,000',
          DocumentNumber: '3770',
          SurveyNumbers: '198/2',
          ChainPropertySize: '136.66 Sq.Yds',
        },
        {
          ExecutantName: 'V Sivaji',
          ClaimantName: 'V Revathi',
          DateOfRegistration: '30-Oct-2021',
          TransactionNature: 'Gift Deed',
          ChainMarketValue: '1,05,228',
          ChainConsidrationValue: ' 1,07,000',
          DocumentNumber: '3770',
          SurveyNumbers: '198/2',
          ChainPropertySize: '136.66 Sq.Yds',
        },
      ],

    ]
  }

  ngOnInit(): void {
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