import { INodeType, INodeTypeDescription, INodeExecutionData, NodeApiError,IExecuteFunctions } from 'n8n-workflow';

export class ExecuteCode implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Execute Code',
        name: 'executeCode',
        icon: 'file:ExecuteCode.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"]}}',
        description: 'Execute code using Judge0 API',
        defaults: {
            name: 'Execute Code',
        },
        inputs: ['main'],
        outputs: ['main'],
        credentials: [
            {
                name: 'executeCodeApi',
                required: true,
            },
        ],
        properties: [

			{
						displayName: 'IdStudent',
						name: 'id',
						type: 'string',
						default: '1',
						description: 'Unique ID to distinguish the student\'s code submission',
			},
            {
                displayName: 'Language Code',
                name: 'language',
                type: 'string',
                default: 'C++',
                description: 'Choose the programming language for the code',
            },
            {
                displayName: 'Delay Time',
                name: 'delayTime',
                type: 'number',
                default: 2000,
                typeOptions: {
                    maxValue: 10000,
                    minValue: 1000,
                    numberPrecision: 0,
                },
                description: 'Enter the delay time in milliseconds between submissions',
            },
						{
							displayName: 'Additional Code',
							name: 'additionalCode',
							type: 'fixedCollection',
							placeholder: 'Add Code',
							default: { codeBlocks: [] },
							typeOptions: {
									multipleValues: true,
							},
							options: [
									{
											displayName: 'Code Blocks',
											name: 'codeBlocks',
											values: [
													{
															displayName: 'Your Code',
															name: 'code',
															type: 'string',
															typeOptions: {
																	rows: 10,
															},
															default: '',
															description: 'Add a code',
													},
													{
														displayName: 'Input for Code',
														name: 'input',
														type: 'string',
														typeOptions: {
																rows: 10,
														},
														default: '',
														description: 'Add input for the code if needed',
												},
											],
									},
							],
							description: 'Add multiple code as needed',
						}

        ],
    };

		async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
			const delayTime = this.getNodeParameter('delayTime',0) as number;
			const items = this.getInputData();
			const credentials = await this.getCredentials('executeCodeApi');

			const results = [];
			try{
				for (let i = 0; i < items.length; i++) {
					const MSSV = this.getNodeParameter('id', i) as string;
					const language = this.getNodeParameter('language', i) as string;
					const languageID = language === 'C' ? 50 : language === 'C++' ? 54 : language === 'Java' ? 62 : 71;
					const codes = this.getNodeParameter('additionalCode.codeBlocks', i) as Array<{ code: string, input: string }>;
					const output: Record<string, string> = {
						MSSV,
						language,
					};
					for (let j = 0; j < codes.length; j++) {
						const code = codes[j].code;
						const input = codes[j].input.toString();
						if (code) {
							try{
								const response = await this.helpers.request({
									method: 'POST',
									url: 'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true',
									body: {
											source_code: Buffer.from(code).toString('base64'),
											language_id: languageID,
											stdin: Buffer.from(input).toString('base64'),
									},
									headers: {
											'X-RapidAPI-Key': credentials.apiKey,
											'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
									},
									json: true,
								});
								if(response.status.description){
									if (response.stdout) {
										response.stdout = Buffer.from(response.stdout, 'base64').toString('utf-8');
									}
									output[`stdout_Bai${j + 1}`] = response.stdout;
									output[`time_Bai${j + 1}`] = response.time;
									output[`memory_Bai${j + 1}`] = response.memory;
								}else{
									output[`stdout_Bai${j + 1}`] = 'Compilation error';
								}
								await new Promise(resolve => setTimeout(resolve, delayTime));
							}catch (error) {
								output[`stdout_Bai${j + 1}`] = `Error: ${error.message}`;
							}
						}else{
							output[`stdout_Bai${j + 1}`] = `Code empty`;
						}
					}
					results.push(output);
				}
				return [this.helpers.returnJsonArray(results)];
			} catch (error) {
				throw new NodeApiError(this.getNode(), error);
			}
		}

}
