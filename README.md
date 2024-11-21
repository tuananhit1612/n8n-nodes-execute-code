![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# n8n-nodes-execute-code

This repository contains a custom n8n node that allows you to execute programming code submissions using the Judge0 API. It is ideal for managing and grading code submissions in programming contests or automated grading systems.

## Prerequisites

Before using this node, make sure you have:

+ An active n8n instance running on your server.
+ Judge0 API credentials (API Key and Host).

## Features

+ Execute code submissions in multiple programming languages (e.g., C, C++, Java, Python).

+ Supports automated grading for coding contests such as ICPC or Hackathons.

+ Handles multiple code snippets and inputs for each submission.

+ Returns detailed execution results, including:

	+ Standard output (stdout)
	+ Execution time
	+ Memory usage
	+	Compilation errors

## Usage
**Node Configuration**

+ ***IdStudent***: Enter a unique ID to identify each student's code submission.
+ ***Language Code***: Specify the programming language (e.g., C++, Java).
+ ***Delay Time***: Set a delay (in milliseconds) between each code submission to avoid hitting API rate limits.
+ ***Additional Code***:
	+ Add multiple code snippets with corresponding inputs for each.
	+ Example:
	```bash
	Code: print("Hello, World!")
	Input: (leave blank if not needed)
	```

**Credentials**

Set up your Judge0 API credentials in n8n:

+ Navigate to Credentials in n8n.

+ Add a new credential with the following details:

	**API Key**: Obtain it from your Judge0 account.

	**Host**: Use `judge0-ce.p.rapidapi.com` for free usage.
