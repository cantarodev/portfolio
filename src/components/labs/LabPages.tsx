import { FailureLab } from "@/components/labs/FailureLab";
import { LabShell } from "@/components/labs/LabShell";
import { QueueLab } from "@/components/labs/QueueLab";
import { TrafficLab } from "@/components/labs/TrafficLab";
import { LABS } from "@/lib/constants";

const [queue, traffic, failure] = LABS;

export function QueueLabPage() {
  return (
    <LabShell currentId="queue" title={queue.name} question={queue.question}>
      <QueueLab />
    </LabShell>
  );
}

export function TrafficLabPage() {
  return (
    <LabShell currentId="traffic" title={traffic.name} question={traffic.question}>
      <TrafficLab />
    </LabShell>
  );
}

export function FailureLabPage() {
  return (
    <LabShell currentId="failure" title={failure.name} question={failure.question}>
      <FailureLab />
    </LabShell>
  );
}
