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
                displayName: 'Language Code',
                name: 'language',
                type: 'options',
                options: [
                    { name: 'C', value: 50 }, // value là id languge tương ứng ở judge0
                    { name: 'C++', value: 54 },
                    { name: 'Java', value: 62 },
                    { name: 'Python', value: 71 },
                ],
                default: 50,
                description: 'Choose the programming language for the code',
            },
            {
                displayName: 'Input Code Type',
                name: 'inputType',
                type: 'options',
                options: [
                    { name: 'Text', value: 'text' },
                    { name: 'File', value: 'file' },
                ],
                default: 'text',
                description: 'Choose how to provide the code',
            },
            {
                displayName: 'Code',
                name: 'code',
                type: 'string',
                typeOptions: {
                    rows: 10,
                    //editor: 'code',
                },
                default: '',
                description: 'Code to execute',
                displayOptions: {
                    show: {
                        inputType: ['text'],
                    },
                },
            },
            {
                displayName: 'Additional Fields',
                name: 'additionalFields',
                type: 'collection',
                placeholder: 'Add Field',
                default: {},
                options: [
                    {
                        displayName: 'Input',
                        name: 'input',
                        type: 'string',
                        default: '',
                        typeOptions: {
                            rows: 5,
                        },
                        description: 'Provide input for the code if needed',
                    },
                ],
            },
        ],
    };
		async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
			const languageId = this.getNodeParameter('language', 0) as number;
			const inputType = this.getNodeParameter('inputType', 0) as string;
			const code = inputType === 'text'
					? (this.getNodeParameter('code', 0) as string)
					: (this.helpers.getBinaryDataBuffer(0, 'codeFile')?.toString() || '');

			const input = this.getNodeParameter('additionalFields.input', 0, '') as string;

			try {
					const credentials = await this.getCredentials('executeCodeApi');

					const response = await this.helpers.request({
						method: 'POST',
						url: 'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true',
						body: {
								source_code: Buffer.from(code).toString('base64'),
								language_id: languageId,
								stdin: Buffer.from(input).toString('base64'),
						},
						headers: {
								'X-RapidAPI-Key': credentials.apiKey,
								'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
						},
						json: true,
				});
				if (response.stdout) {
					response.stdout = Buffer.from(response.stdout, 'base64').toString('utf-8');
				}
				return [this.helpers.returnJsonArray(response)];
			} catch (error) {
					throw new NodeApiError(this.getNode(), error);
			}
	}

}
