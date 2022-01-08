import { Component, ViewEncapsulation, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
    selector: 'app-chain-details',
    templateUrl: './chain-details.component.html',
    encapsulation: ViewEncapsulation.None
})

export class ChainDetailsComponent implements OnInit {
    @Input() data: any;
    public propertyNumberType = 'Survey Number';
    public nameLimit: number = 50;
    public sizeSurveyNumberLimit: number = 20;
    public executantName: string = '';
    public claimantName: string = '';
    public propertySize: string = '';
    public surveyNumber: string = '';

    constructor(private activatedRoute: ActivatedRoute, router: Router) {
    }

    ngOnInit(): void {
        this.data.marketValue = this.replaceString(this.data.marketValue);
        this.data.considerationValue = this.replaceString(this.data.considerationValue);
        this.executantName = this.constructName(this.data.executantName, this.nameLimit, 'and others');
        this.claimantName = this.constructName(this.data.claimantName, this.nameLimit, 'and others');
        this.propertySize = this.constructName(this.data.propertySize, this.nameLimit, '...');
        this.surveyNumber = this.constructName(this.data.surveyNumber, this.nameLimit, '...');
      
    }

    constructName(name: string, limit: number, endText: string): string {
        if (name) {
            const nameReplace = this.replaceString(name);
            const splitName = nameReplace.split(', ');
            const splitNameLength = splitName && splitName.length > 0 ? splitName.length : 0;
            if (splitNameLength === 1) {
                return splitName[0];
            }
            if (splitNameLength > 1) {
                let concatName = '';
                for (const sname of splitName) {
                    const tempName = concatName ? `${concatName}, ${sname}` : sname;
                    if (tempName.length >= limit) {
                        const result = concatName ? concatName : tempName;
                        return `${result} ${endText}`;
                    }
                    concatName = tempName;
                }
                return concatName;
            }
        }
        return '';
    }

    replaceString(name: string) {
        if (name) {
            return name.replace(/\#\#/g, ', ');
        }
        return '';
    }
}
