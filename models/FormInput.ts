export enum Form {
    Title = "title",
    Description = "description",
    Outcome = "outcome",
    Outcomes = "outcomes",
    Category = "category",
    Image = "image",
    Icon = "icon",
    Fee = "fee",
    Oracle = "oracle",
    ResolutionSource = "resolutionSource",
    SubmittedBy = "submittedBy",
    EndDate = "endDate",
    WideFormat = "wideFormat",
    UserDefinedGas = "userDefinedGas",
    MarketMakerAddress = "marketMakerAddress",
}

export interface FormTypes {
    [Form.Title]: string;
    [Form.Description]: string;
    [Form.Outcome]: string;
    [Form.Outcomes]: string[];
    [Form.Category]: string;
    [Form.Image]: string;
    [Form.Icon]: string;
    [Form.Fee]: number;
    [Form.Oracle]: string;
    [Form.ResolutionSource]: string;
    [Form.SubmittedBy]: string;
    [Form.EndDate]: string;
    [Form.WideFormat]: boolean;
    [Form.UserDefinedGas]: number;
    [Form.MarketMakerAddress]: string | undefined;
}
