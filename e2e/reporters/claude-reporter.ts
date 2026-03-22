import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from "@playwright/test/reporter";
import * as fs from "fs";
import * as path from "path";

interface TestEntry {
  title: string;
  file: string;
  status: "passed" | "failed" | "timedOut" | "skipped" | "interrupted";
  duration: number;
  error?: string;
  screenshot?: string;
}

interface ReportData {
  timestamp: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  };
  tests: TestEntry[];
}

class ClaudeReporter implements Reporter {
  private tests: TestEntry[] = [];
  private startTime = 0;
  private outputDir: string;

  constructor() {
    this.outputDir = path.resolve(__dirname, "..", "results");
  }

  onBegin(_config: FullConfig, _suite: Suite) {
    this.startTime = Date.now();
    this.tests = [];
    fs.mkdirSync(this.outputDir, { recursive: true });
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const entry: TestEntry = {
      title: test.titlePath().slice(1).join(" > "),
      file: path.relative(process.cwd(), test.location.file),
      status: result.status,
      duration: result.duration,
    };

    if (result.status === "failed" || result.status === "timedOut") {
      const errorMessages = result.errors
        .map((e) => e.message || e.stack || "Unknown error")
        .join("\n---\n");
      entry.error = errorMessages;

      // Record screenshot paths
      const screenshots = result.attachments.filter(
        (a) => a.contentType === "image/png" && a.path
      );
      if (screenshots.length > 0) {
        entry.screenshot = screenshots[0].path;
      }
    }

    this.tests.push(entry);
  }

  onEnd(result: FullResult) {
    const totalDuration = Date.now() - this.startTime;
    const passed = this.tests.filter((t) => t.status === "passed").length;
    const failed = this.tests.filter(
      (t) => t.status === "failed" || t.status === "timedOut"
    ).length;
    const skipped = this.tests.filter((t) => t.status === "skipped").length;

    const reportData: ReportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.tests.length,
        passed,
        failed,
        skipped,
        duration: totalDuration,
      },
      tests: this.tests,
    };

    // Write JSON report
    fs.writeFileSync(
      path.join(this.outputDir, "report.json"),
      JSON.stringify(reportData, null, 2)
    );

    // Write Markdown report
    const md = this.generateMarkdown(reportData);
    fs.writeFileSync(path.join(this.outputDir, "report.md"), md);
  }

  private generateMarkdown(data: ReportData): string {
    const lines: string[] = [];
    const { summary } = data;

    lines.push("# E2E Test Report");
    lines.push("");
    lines.push(`**Timestamp:** ${data.timestamp}`);
    lines.push(`**Duration:** ${(summary.duration / 1000).toFixed(1)}s`);
    lines.push("");

    // Summary
    const statusIcon = summary.failed === 0 ? "PASS" : "FAIL";
    lines.push(`## Summary: ${statusIcon}`);
    lines.push("");
    lines.push(`| Metric | Count |`);
    lines.push(`|--------|-------|`);
    lines.push(`| Total  | ${summary.total} |`);
    lines.push(`| Passed | ${summary.passed} |`);
    lines.push(`| Failed | ${summary.failed} |`);
    lines.push(`| Skipped | ${summary.skipped} |`);
    lines.push("");

    // Failed tests with details
    const failedTests = data.tests.filter(
      (t) => t.status === "failed" || t.status === "timedOut"
    );

    if (failedTests.length > 0) {
      lines.push("## Failed Tests");
      lines.push("");

      for (const test of failedTests) {
        lines.push(`### ${test.title}`);
        lines.push(`- **File:** \`${test.file}\``);
        lines.push(`- **Status:** ${test.status}`);
        lines.push(`- **Duration:** ${test.duration}ms`);

        if (test.error) {
          lines.push("- **Error:**");
          lines.push("```");
          lines.push(test.error);
          lines.push("```");
        }

        if (test.screenshot) {
          lines.push(`- **Screenshot:** \`${test.screenshot}\``);
        }

        lines.push("");
      }
    }

    // Passed tests (compact)
    const passedTests = data.tests.filter((t) => t.status === "passed");
    if (passedTests.length > 0) {
      lines.push("## Passed Tests");
      lines.push("");
      for (const test of passedTests) {
        lines.push(`- [PASS] ${test.title} (${test.duration}ms)`);
      }
      lines.push("");
    }

    return lines.join("\n");
  }
}

export default ClaudeReporter;
