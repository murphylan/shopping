"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

interface DeleteConfirmProps {
  entityName: string;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  children?: React.ReactNode;
  trigger?: React.ReactNode;
  /** 受控模式（与 onOpenChange 同用）：用于 DropdownMenu 等会卸载子树的场景，勿将本组件放在菜单内部 */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DeleteConfirm({
  entityName,
  isLoading = false,
  onConfirm,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: DeleteConfirmProps) {
  const isControlled = controlledOpen !== undefined;

  const dialogBody = (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>确认删除</AlertDialogTitle>
        <AlertDialogDescription>
          确定要删除「{entityName}」吗？此操作不可撤销。
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>取消</AlertDialogCancel>
        <AlertDialogAction
          onClick={(e) => {
            e.preventDefault();
            void onConfirm();
          }}
          disabled={isLoading}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="mr-2 h-4 w-4" />
          )}
          确认删除
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );

  if (isControlled) {
    return (
      <AlertDialog open={controlledOpen} onOpenChange={onOpenChange}>
        {dialogBody}
      </AlertDialog>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">删除</span>
          </Button>
        )}
      </AlertDialogTrigger>
      {dialogBody}
    </AlertDialog>
  );
}
